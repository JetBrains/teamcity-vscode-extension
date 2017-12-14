"use strict";

import * as fs from "fs";
import * as path from "path";

/*
    Provides storage of credentials in a file on the local file system.
    Does not support any kind of 'prefix' of the credential (since this
    storage mechanism is not shared with either Windows or OSX).  The
    file is secured as RW for the owner of the process.
 */
export class FileTokenStorage {
    private filename: string;

    constructor(filename: string) {
        this.filename = filename;
    }

    public addEntries(newEntries: Array<any>, existingEntries: Array<any>) : Promise<void> {
        const entries: Array<any> = existingEntries.concat(newEntries);
        return this.saveEntries(entries);
    }

    public clear() : Promise<void> {
        return this.saveEntries([]);
    }

    public loadEntries(): any[] {
        let entries: Array<any> = [];
        let err: any;

        try {
            const content: string = fs.readFileSync(this.filename, {encoding: "utf8", flag: "r"});
            entries = JSON.parse(content);
            return entries;
        } catch (ex) {
            if (ex.code !== "ENOENT") {
                err = ex;
                throw new Error(err);
            } else {
                // If it is ENOENT (the file doesn't exist or can't be found)
                // Return an empty array (no items yet)
                return [];
            }
        }
    }

    public removeEntries(entriesToKeep: Array<any> /*, entriesToRemove?: Array<any>*/): Promise<void> {
        return this.saveEntries(entriesToKeep);
    }

    private saveEntries(entries: Array<any>) : Promise<void> {
        const writeOptions = {
            encoding: "utf8",
            mode: 384, // Permission 0600 - owner read/write, nobody else has access
            flag: "w"
        };

        // If the path we want to store in doesn't exist, create it
        const folder: string = path.dirname(this.filename);
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }

        return new Promise<void>((resolve, reject) => {
            fs.writeFile(this.filename, JSON.stringify(entries), writeOptions, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(undefined);
                }
            });
        });
    }
}
