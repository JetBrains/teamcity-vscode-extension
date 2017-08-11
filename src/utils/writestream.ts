"use strict";

import * as fs from "fs";
import { Disposable } from "vscode";
import { VsCodeUtils } from "../utils/vscodeutils";
import { ByteWriter } from "../utils/bytewriter";
import { FileController } from "../utils/filecontroller";

export class AsyncWriteStream implements Disposable {
    private readonly _writeSteam: fs.WriteStream;

    constructor(fileAbsPath : string) {
        this._writeSteam = fs.createWriteStream(fileAbsPath);
    }

    public async write(buffer : Buffer) : Promise<{}> {
        return new Promise((resolve, reject) => {
            this._writeSteam.write(buffer, (err) => {
                if (err) {
                    reject(VsCodeUtils.formatErrorMessage(err));
                }
                resolve();
            });
        });
    }

    public async writeFile(fileAbsPath : string) : Promise<{}> {
        const stats : fs.Stats = fs.statSync(fileAbsPath);
        const fileSizeInBytes : number = stats.size;
        const fileSizeBuffer : Buffer = ByteWriter.longToByteArray(fileSizeInBytes);
        await this.write(fileSizeBuffer);
        const readstream : fs.ReadStream = fs.createReadStream(fileAbsPath);
        readstream.pipe(this._writeSteam, {end: false});
        return new Promise((resolve, reject) => {
            readstream.on("end", function() {
                resolve();
            });

            readstream.on("error", function() {
                reject("An error occurs during piping from source file to the writeStream");
            });

            this._writeSteam.on("error", function() {
                reject("An error occurs during piping from source file to the writeStream");
            });
        });
    }

    public dispose() {
        this._writeSteam.end();
    }
}
