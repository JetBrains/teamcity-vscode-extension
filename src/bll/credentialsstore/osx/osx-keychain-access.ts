"use strict";

import {inject, injectable} from "inversify";
import {OsxSecurityParsingStream, OsxSecurityParsingStreamWrapper} from "./osx-keychain-parser";
import {TYPES} from "../../utils/constants";
import * as childProcessPromise from "child-process-promise";
const childProcess = require("child_process");
const es = require("event-stream");

@injectable()
export class OsxKeychain {

    private readonly securityPath: string = "/usr/bin/security";
    private targetNamePrefix: string = "";
    private parser: () => OsxSecurityParsingStream;

    public constructor(@inject(TYPES.OsxSecurityParsingStreamWrapper) wrapper: OsxSecurityParsingStreamWrapper) {
        this.parser = wrapper.parser;
    }

    public setPrefix(prefix: string) {
        this.targetNamePrefix = prefix;
    }

    public getCredentialsWithoutPasswordsListStream() {
        const securityProcess = childProcess.spawn(this.securityPath, ["dump-keychain"]);
        return securityProcess.stdout
            .pipe(es.split())
            .pipe(es.mapSync(function (line) {
                return line.replace(/\\134/g, "\\");
            }))
            .pipe(this.parser());
    }

    public async getPasswordForUser(targetName: string): Promise<string> {
        const args = [
            "find-generic-password",
            "-a", targetName,
            "-s", this.targetNamePrefix,
            "-g"
        ];
        const childProcess = await childProcessPromise.execFile(this.securityPath, args);
        const match = /^password: (?:0x[0-9A-F]+ {2})?"(.*)"$/m.exec(childProcess.stderr);
        if (!match) {
            throw new Error("Password is in invalid format");

        }
        return match[1].replace(/\\134/g, "\\");
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

        return childProcessPromise.execFile(this.securityPath, args);
    }

    public remove(userName, description): Promise<void> {
        let args = ["delete-generic-password"];
        if (userName) {
            args = args.concat(["-a", userName]);
        }
        if (description) {
            args = args.concat(["-D", description]);
        }

        return childProcessPromise.execFile(this.securityPath, args);
    }
}
