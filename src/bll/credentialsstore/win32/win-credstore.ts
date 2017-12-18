"use strict";

import {Stream} from "stream";
import {injectable} from "inversify";
const childProcess = require("child_process");
const es = require("event-stream");
const path = require("path");
const parser = require("./win-credstore-parser");
const credExePath = path.join(__dirname, "../bin/win32/creds.exe");

@injectable()
export class WinPersistentCredentialsStore {
    private targetNamePrefix: string = "";

    public setPrefix(prefix: string): void {
        this.targetNamePrefix = prefix;
    }

    public ensurePrefix(targetName: string): string {
        if (targetName.slice(this.targetNamePrefix.length) !== this.targetNamePrefix) {
            targetName = this.targetNamePrefix + targetName;
        }
        return targetName;
    }

    public removePrefix(targetName): string {
        return targetName.slice(this.targetNamePrefix.length);
    }

    public getCredentialsListStream(): Stream {
        const credsProcess = childProcess.spawn(credExePath, ["-s", "-g", "-t", this.targetNamePrefix + "*"]);
        return credsProcess.stdout
            .pipe(parser())
            .pipe(es.mapSync((cred) => {
                cred.targetName = this.removePrefix(cred.targetName);
                return cred;
            }));
    }

    public get(targetName: string): Promise<string> {
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
            .on("data", (line) => {
                errors.push(line);
            });
        return new Promise<string>((resolve, reject) => {
            credsProcess.on("exit", (code) => {
                if (code === 0) {
                    resolve(result);
                } else {
                    reject("Getting credential failed, exit code " + code + ": " + errors.join(", "));
                }
            });
        });
    }

    public set(targetName: string, password: string): Promise<void> {
        const passwordBuffer: Buffer = new Buffer(password, "utf8");
        const args = [
            "-a",
            "-t", this.ensurePrefix(targetName),
            "-p", passwordBuffer.toString("hex")
        ];

        return new Promise<void>((resolve, reject) => {
            childProcess.execFile(credExePath, args, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    public remove(targetName): Promise<void> {
        const args = [
            "-d",
            "-t", this.ensurePrefix(targetName)
        ];

        if (targetName.slice(-1) === "*") {
            args.push("-g");
        }
        return new Promise<void>((resolve, reject) => {
            childProcess.execFile(credExePath, args, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
}
