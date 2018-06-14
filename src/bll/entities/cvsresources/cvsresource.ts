import {CvsFileStatusCode} from "../../utils/constants";
import {ByteWriter} from "../../utils/bytewriter";
import {ReadableSet} from "../../utils/readableset";
import {Logger} from "../../utils/logger";
import * as fs from "fs";
import * as stream from "stream";

export abstract class CvsResource {
    status: CvsFileStatusCode;
    fileAbsPath: string;
    fileName: string;
    serverFilePath?: string;
    prevServerFilePath?: string;
    prevFileAbsPath?: string;

    protected constructor(status: CvsFileStatusCode, fileAbsPath: string, fileName: string, prevFileAbsPath?: string) {
        this.status = status;
        this.fileAbsPath = fileAbsPath;
        this.fileName = fileName;
        this.prevFileAbsPath = prevFileAbsPath;
    }

    public abstract getPrefix(): number;

    public getHeaderForPatch(): Buffer {
        const prefix: number = this.getPrefix();
        const bytePrefix: Buffer = ByteWriter.writeByte(prefix);
        const byteFileName: Buffer = ByteWriter.writeUTF(this.serverFilePath);
        return Buffer.concat([bytePrefix, byteFileName]);
    }

    public async getContentForPatch(): Promise<ReadableSet> {
        if (!this.fileAbsPath) {
            const errMsg: string = "File abs path is undefined. Could not get file content for patching.";
            Logger.logError(errMsg);
            return Promise.reject(errMsg);
        }
        Logger.logDebug(`CvsLocalResource#getContentForPatch: file path: ${this.fileAbsPath}`);
        const stats: fs.Stats = fs.statSync(this.fileAbsPath);
        const fileSizeInBytes: number = stats.size;
        Logger.logDebug(`CvsLocalResource#getContentForPatch: file size in bytes: ${fileSizeInBytes}`);
        const readStream: stream.Readable = fs.createReadStream(this.fileAbsPath);
        return {stream: readStream, length: fileSizeInBytes};
    }
}
