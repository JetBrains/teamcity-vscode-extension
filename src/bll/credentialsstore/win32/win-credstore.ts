"use strict";

import {Stream} from "stream";
import {inject, injectable} from "inversify";
import {WinCredStoreParsingStream, WinCredStoreParsingStreamWrapper} from "./win-credstore-parser";
import {TYPES} from "../../utils/constants";
import {CpProxy} from "../../moduleproxies/cp-proxy";
import {mapSync} from "event-stream";
import {join} from "path";
const credExePath = join(__dirname, "../bin/win32/creds.exe");

@injectable()
export class WinPersistentCredentialsStore {
    private targetNamePrefix: string = "";
    private parser: () => WinCredStoreParsingStream;
    private cp: CpProxy;

    public constructor(@inject(TYPES.WinCredStoreParsingStreamWrapper) wrapper: WinCredStoreParsingStreamWrapper,
                       @inject(TYPES.CpProxy) cp: CpProxy) {
        this.parser = wrapper.parser;
        this.cp = cp;
    }

    public setPrefix(prefix: string): void {
        this.targetNamePrefix = prefix;
    }

    public getCredentialsListStream(): Stream {
        const credsProcess = this.cp.spawn(credExePath, ["-s", "-g", "-t", this.targetNamePrefix + "*"]);
        return credsProcess.stdout
            .pipe(this.parser())
            .pipe(mapSync((cred) => {
                cred.targetName = this.removePrefix(cred.targetName);
                return cred;
            }));
    }

    private removePrefix(targetName): string {
        return targetName.slice(this.targetNamePrefix.length);
    }

    public async set(targetName: string, password: string): Promise<void> {
        const passwordBuffer: Buffer = new Buffer(password, "utf8");
        const args = [
            "-a",
            "-t", this.ensurePrefix(targetName),
            "-p", passwordBuffer.toString("hex")
        ];
        return this.cp.execFileAsync(credExePath, args);
    }

    private ensurePrefix(targetName: string): string {
        if (targetName.slice(this.targetNamePrefix.length) !== this.targetNamePrefix) {
            targetName = this.targetNamePrefix + targetName;
        }
        return targetName;
    }

    public remove(targetName): Promise<void> {
        const args = [
            "-d",
            "-t", this.ensurePrefix(targetName)
        ];
        if (targetName.slice(-1) === "*") {
            args.push("-g");
        }
        return this.cp.execFileAsync(credExePath, args);
    }
}
