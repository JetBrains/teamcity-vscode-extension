"use strict";

import {injectable} from "inversify";
const childProcess = require("child_process");
const es = require("event-stream");
const parser = require("./osx-keychain-parser");

@injectable()
export class OsxKeychain {

    private readonly securityPath: string = "/usr/bin/security";
    private targetNamePrefix: string = "";

    public setPrefix(prefix: string) {
        this.targetNamePrefix = prefix;
    }

    public removePrefix(targetName) {
        return targetName.slice(this.targetNamePrefix.length);
    }

    public getCredentialsWithoutPasswordsListStream() {
        const securityProcess = childProcess.spawn(this.securityPath, ["dump-keychain"]);

        return securityProcess.stdout
            .pipe(es.split())
            .pipe(es.mapSync(function (line) {
                return line.replace(/\\134/g, "\\");
            }))
            .pipe(new parser.ParsingStream());
    }

    public getPasswordForUser(userName): Promise<string> {
        const args = [
            "find-generic-password",
            "-a", userName,
            "-s", this.targetNamePrefix,
            "-g"
        ];
        return new Promise<string>((resolve, reject) => {
            childProcess.execFile(this.securityPath, args, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                const match = /^password: (?:0x[0-9A-F]+ {2})?"(.*)"$/m.exec(stderr);
                if (match) {
                    const password = match[1].replace(/\\134/g, "\\");
                    return resolve(password);
                }
                reject("Password is in invalid format");
            });
        });
    }

    public set(userName, description, password): Promise<void> {
        const args = [
            "add-generic-password",
            "-a", userName,
            "-D", description,
            "-s", this.targetNamePrefix,
            "-w", password,
            "-U"
        ];

        return new Promise<void>((resolve, reject) => {
            childProcess.execFile(this.securityPath, args, (err, stdout, stderr) => {
                if (err) {
                    return reject(new Error("Could not add password to keychain: " + stderr));
                }
                resolve();
            });
        });
    }

    public remove(userName, description): Promise<void> {
        let args = ["delete-generic-password"];
        if (userName) {
            args = args.concat(["-a", userName]);
        }
        if (description) {
            args = args.concat(["-D", description]);
        }

        return new Promise<void>((resolve, reject) => {
            childProcess.execFile(this.securityPath, args, (err) => {
                if (err) {
                    reject(err);
                }

                resolve();
            });
        });
    }
}