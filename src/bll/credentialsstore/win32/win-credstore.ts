"use strict";

import {Stream} from "stream";
const _ = require("underscore");
const childProcess = require("child_process");
const es = require("event-stream");
const path = require("path");

const parser = require("./win-credstore-parser");
const credExePath = path.join(__dirname, "../bin/win32/creds.exe");

export class WinPersistentCredentialsStore {
    private static targetNamePrefix: string = "";

    public static setPrefix(prefix: string) {
        this.targetNamePrefix = prefix;
    }

    public static ensurePrefix(targetName) {
        if (targetName.slice(this.targetNamePrefix.length) !== this.targetNamePrefix) {
            targetName = this.targetNamePrefix + targetName;
        }
        return targetName;
    }

    public static removePrefix(targetName) {
        return targetName.slice(this.targetNamePrefix.length);
    }

    /**
     * list the contents of the credential store, parsing each value.
     *
     * We ignore everything that wasn't put there by us, we look
     * for target names starting with the target name prefix.
     *
     *
     * @return {Stream} object mode stream of credentials.
     */
    public static list(): Stream {
        const credsProcess = childProcess.spawn(credExePath, ["-s", "-g", "-t", this.targetNamePrefix + "*"]);
        return credsProcess.stdout
            .pipe(parser())
            .pipe(es.mapSync((cred) => {
                cred.targetName = WinPersistentCredentialsStore.removePrefix(cred.targetName);
                return cred;
            }));
    }

    /**
     * Get details for a specific credential. Assumes generic credential.
     *
     * @param {string} targetName target name for credential
     * @param {function (err, credential)} callback callback function that receives
     *                                              returned credential.
     */
    public static get(targetName, callback) {
        const args = [
            "-s",
            "-t", this.ensurePrefix(targetName)
        ];

        const credsProcess = childProcess.spawn(credExePath, args);
        let result = undefined;
        const errors = [];

        credsProcess.stdout.pipe(parser())
            .on("data", function (credential) {
                result = credential;
                result.targetName = this.removePrefix(result.targetName);
            });

        credsProcess.stderr.pipe(es.split())
            .on("data", function (line) {
                errors.push(line);
            });

        credsProcess.on("exit", function (code) {
            if (code === 0) {
                callback(undefined, result);
            } else {
                callback(new Error("Getting credential failed, exit code " + code + ": " + errors.join(", ")));
            }
        });
    }

    /**
     * Set the credential for a given key in the credential store.
     * Creates or updates, assumes generic credential.
     * If credential is buffer, stores buffer contents as binary directly.
     * If credential is string, stores UTF-8 encoded binary.
     *
     * @param {String} targetName target name for entry
     * @param {Buffer|String} credential the credential
     * @param {Function(err)} callback completion callback
     */
    public static set(targetName, credential, callback) {
        if (_.isString(credential)) {
            credential = new Buffer(credential, "utf8");
        }
        const args = [
            "-a",
            "-t", this.ensurePrefix(targetName),
            "-p", credential.toString("hex")
        ];

        childProcess.execFile(credExePath, args, function (err) {
            callback(err);
        });
    }

    /**
     * Remove the given key from the credential store.
     *
     * @param {string} targetName target name to remove.
     *                            if ends with "*" character,
     *                            will delete all targets
     *                            starting with that prefix
     * @param {Function(err)} callback completion callback
     */
    public static remove(targetName, callback) {
        const args = [
            "-d",
            "-t", this.ensurePrefix(targetName)
        ];

        if (targetName.slice(-1) === "*") {
            args.push("-g");
        }

        childProcess.execFile(credExePath, args, function (err) {
            callback(err);
        });
    }
}
