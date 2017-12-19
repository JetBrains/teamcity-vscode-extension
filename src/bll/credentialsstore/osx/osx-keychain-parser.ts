"use strict";

const stream = require("readable-stream");
const Transform = stream.Transform;
import {injectable} from "inversify";

@injectable()
export class OsxSecurityParsingStreamWrapper {
    public parser(): OsxSecurityParsingStream {
        return new OsxSecurityParsingStream();
    }
}

export class OsxSecurityParsingStream extends (Transform as { new(): any; }) {

    private readonly rootFieldMask = /^([^:]+):(?: (?:"([^"]+)")|(.*))?$/;
    private readonly propertiesMask = /^ {4}(?:(0x[0-9a-fA-F]+) |"([a-z]{4})")<[^>]+>=(?:(<NULL>)|"([^"]+)"|(0x[0-9a-fA-F]+)(?: {2}"([^"]+)")|(.*)?)/;

    private currentKeychain: string;
    private hadAttributesString: boolean = false;

    public constructor() {
        super();
        Transform.call(this, {
            objectMode: true
        });

        this.currentEntry = undefined;
    }

    public _transform(chunk, encoding, callback) {
        const chunkData: string = chunk.toString();
        if (!chunkData && chunkData === "") {
            callback();
            return;
        }
        chunkData.split("\n").forEach((line) => {
            this.processNextLine(line);
        });

        callback();
    }

    private processNextLine(line: string): void {
        if (!this.currentKeychain) {
            this.currentKeychain = this.getInitialKeychainValue(line);
            if (this.currentKeychain) {
                this.currentEntry = {
                    keychain: this.currentKeychain
                };
            }
        } else {
            if (!this.hadAttributesString) {
                if (this.isAttributesString(line)) {
                    this.hadAttributesString = true;
                } else {
                    this.collectMetaInfo(line);
                }
            } else {
                this.collectProperties(line);
            }
        }
    }

    private getInitialKeychainValue(line: string): string {
        let keychain: string;
        const match = this.rootFieldMask.exec(line);
        if (match && match[1] === "keychain") {
            keychain = match[2];
        }
        return keychain;
    }

    private isAttributesString(line: string): boolean {
        const match = this.rootFieldMask.exec(line);
        return match && match[1] === "attributes";
    }

    private collectMetaInfo(line: string): void {
        const match = this.rootFieldMask.exec(line);
        if (match) {
            this.currentEntry[match[1]] = match[2];
        }
    }

    private collectProperties(line: string): void {
        const match = this.propertiesMask.exec(line);
        if (match) {
            if (match[2]) {
                const value = match[6] || match[4];
                if (value) {
                    this.currentEntry[match[2]] = value;
                }
            }
        } else {
            this.finalize(line);
        }
    }

    private finalize(line ?:string): void {
        if (this.currentEntry) {
            this.push(this.currentEntry);
            this.currentEntry = undefined;
            this.currentKeychain = undefined;
            this.hadAttributesString = false;
            if (line) {
                this.processNextLine(line);
            }
        }
    }

    public _final(callback) {
        this.finalize();
        callback();
    }
}
