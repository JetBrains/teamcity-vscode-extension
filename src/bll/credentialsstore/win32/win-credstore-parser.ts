"use strict";

import {Transform} from "readable-stream";
import {injectable} from "inversify";

@injectable()
export class WinCredStoreParsingStreamWrapper {
    public parser(): WinCredStoreParsingStream {
        return new WinCredStoreParsingStream();
    }
}

export class WinCredStoreParsingStream extends (Transform as { new(): any; }) {

    private static parseInputFieldsRegExp: RegExp = /^([^:]+):\s(.*)$/m;

    constructor() {
        super();
        Transform.call(this, {
            objectMode: true
        });
        this.currentEntry = undefined;
    }

    public _transform(chunk, encoding, callback) {
        const lines = chunk.toString();

        if (!lines) {
            callback();
        }

        if (WinCredStoreParsingStream.isNewData(lines)) {
            this.ensureCurrentEntryInitialized();
            lines.split("\n").forEach((line) => {
                const match = WinCredStoreParsingStream.parseInputFieldsRegExp.exec(line);
                if (match) {
                    const key = WinCredStoreParsingStream.separateWordsToCamelCase(match[1]);
                    this.currentEntry[key] = match[2];
                }
            });
        }

        callback();
    }

    private static isNewData(line: string): boolean {
        return line !== "";
    }

    private ensureCurrentEntryInitialized() {
        if (!this.currentEntry) {
            this.currentEntry = {};
        }
    }

    private static separateWordsToCamelCase(fieldName: string): string {
        const parts = fieldName.split(" ");
        parts[0] = parts[0].toLowerCase();
        return parts.join("");
    }

    public _final(callback) {
        if (this.currentEntry) {
            this.push(this.currentEntry);
            this.currentEntry = undefined;
        }
        callback();
    }
}
