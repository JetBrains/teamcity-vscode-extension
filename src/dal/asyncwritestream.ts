import * as fs from "fs";
import * as stream from "stream";
import {Disposable} from "vscode";
import {Logger} from "../bll/utils/logger";
import {ByteWriter} from "../bll/utils/bytewriter";
import {ReadableSet} from "../bll/utils/readableset";
import {Utils} from "../bll/utils/utils";

export class AsyncWriteStream implements Disposable {
    private readonly _writeSteam: fs.WriteStream;

    constructor(fileAbsPath: string) {
        this._writeSteam = fs.createWriteStream(fileAbsPath);
    }

    public async write(buffer: Buffer): Promise<{}> {
        return new Promise((resolve, reject) => {
            this._writeSteam.write(buffer, (err) => {
                if (err) {
                    Logger.logError(`AsyncWriteStream#write: an error occurs ${Utils.formatErrorMessage(err)}`);
                    reject(Utils.formatErrorMessage(err));
                }
                resolve();
            });
        });
    }

    public async writeStreamedFile(readableSet: ReadableSet): Promise<{}> {
        const fileSizeInBytes: number = readableSet.length;
        Logger.logDebug(`AsyncWriteStream#writeStreamedFile: file size in bytes: ${fileSizeInBytes}`);
        const fileSizeBuffer: Buffer = ByteWriter.longToByteArray(fileSizeInBytes);
        await this.write(fileSizeBuffer);
        const readStream: stream.Readable = readableSet.stream;
        readableSet.stream.pipe(this._writeSteam, {end: false});
        return new Promise((resolve, reject) => {
            readStream.on("end", function () {
                Logger.logDebug(`AsyncWriteStream#writeStreamedFile: file was successfully added to the patch`);
                resolve();
            });
            readStream.on("close", function () {
                Logger.logDebug(`AsyncWriteStream#writeStreamedFile: file was closed`);
                resolve();
            });
            readStream.on("error", function () {
                Logger.logError(`AsyncWriteStream#writeStreamedFile: an error occurs at the readStream`);
                reject("An error occurs during piping from source file to the writeStream");
            });

            this._writeSteam.on("error", function () {
                Logger.logError(`AsyncWriteStream#writeStreamedFile: an error occurs at the writeStream`);
                reject("An error occurs during piping from source file to the writeStream");
            });
        });
    }

    public dispose() {
        this._writeSteam.end();
    }
}
