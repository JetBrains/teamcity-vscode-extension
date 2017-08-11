"use strict";

import * as fs from "fs";
import { Disposable } from "vscode";
import { VsCodeUtils } from "../utils/vscodeutils";
import { ByteWriter } from "../utils/bytewriter";
import { FileController } from "../utils/filecontroller";

export class AsyncWriteStream implements Disposable {
    private readonly _ws: fs.WriteStream;

    constructor(fileAbsPath : string) {
        this._ws = fs.createWriteStream(fileAbsPath);
    }

    public async write(buffer : Buffer) : Promise<{}> {
        return new Promise((resolve, reject) => {
            this._ws.write(buffer, (err) => {
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
        const stream : fs.ReadStream = fs.createReadStream(fileAbsPath);
        stream.pipe(this._ws, {end: false});
        return new Promise((resolve, reject) => {
            stream.on("end", function() {
                resolve();
            });
        });
    }

    public dispose() {
       // this._ws.end();
    }
}
