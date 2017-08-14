"use strict";

import * as fs from "fs";
import { Disposable } from "vscode";
import { VsCodeUtils } from "../utils/vscodeutils";
import { ByteWriter } from "../utils/bytewriter";
import { Logger } from "../utils/logger";

export class AsyncWriteStream implements Disposable {
    private readonly _writeSteam: fs.WriteStream;

    constructor(fileAbsPath : string) {
        this._writeSteam = fs.createWriteStream(fileAbsPath);
    }

    public async write(buffer : Buffer) : Promise<{}> {
        return new Promise((resolve, reject) => {
            this._writeSteam.write(buffer, (err) => {
                if (err) {
                    Logger.logError(`AsyncWriteStream#write: an error occurs ${VsCodeUtils.formatErrorMessage(err)}`)
                    reject(VsCodeUtils.formatErrorMessage(err));
                }
                resolve();
            });
        });
    }

    public async writeFile(fileAbsPath : string) : Promise<{}> {
        Logger.logDebug(`AsyncWriteStream#writeFile: file path: ${fileAbsPath}`);
        const stats : fs.Stats = fs.statSync(fileAbsPath);
        const fileSizeInBytes : number = stats.size;
        Logger.logDebug(`AsyncWriteStream#writeFile: file size in bytes: ${fileSizeInBytes}`);
        const fileSizeBuffer : Buffer = ByteWriter.longToByteArray(fileSizeInBytes);
        await this.write(fileSizeBuffer);
        const readstream : fs.ReadStream = fs.createReadStream(fileAbsPath);
        readstream.pipe(this._writeSteam, {end: false});
        return new Promise((resolve, reject) => {
            readstream.on("end", function() {
                Logger.logDebug(`AsyncWriteStream#writeFile: file was successfully added to the patch`);
                resolve();
            });

            readstream.on("error", function() {
                Logger.logError(`AsyncWriteStream#writeFile: an error occurs at the readStream`);
                reject("An error occurs during piping from source file to the writeStream");
            });

            this._writeSteam.on("error", function() {
                Logger.logError(`AsyncWriteStream#writeFile: an error occurs at the writeStream`);
                reject("An error occurs during piping from source file to the writeStream");
            });
        });
    }

    public dispose() {
        this._writeSteam.end();
    }
}
