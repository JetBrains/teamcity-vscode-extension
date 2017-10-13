"use strict";

import * as fs from "fs";
import * as path from "path";
import {Logger} from "./logger";
import {ByteWriter} from "./bytewriter";
import * as fs_async from "async-file";
import {VsCodeUtils} from "./vscodeutils";
import {CvsFileStatusCode} from "./constants";
import {AsyncWriteStream} from "../../dal/asyncwritestream";
import {CvsSupportProvider} from "../../dal/cvsprovider";
import {CheckInInfo} from "../entities/checkininfo";
import {CvsLocalResource} from "../entities/cvslocalresource";
import {MappingFileContent} from "../remoterun/mappingfilecontent";
import {ReadableSet} from "./readableset";
import {injectable} from "inversify";
const temp = require("temp").track();

@injectable()
export class PatchManager {

    public async preparePatch(checkInArray: CheckInInfo[]): Promise<string> {
        if (!checkInArray && checkInArray.length === 0) {
            return;
        }
        const patchBuilder: PatchBuilder = new PatchBuilder();
        await patchBuilder.init();
        for (let i = 0; i < checkInArray.length; i++) {
            const checkInInfo = checkInArray[i];
            await this.appendCheckInInfo(patchBuilder, checkInInfo);
        }
        return patchBuilder.finishPatching();
    }

    private async appendCheckInInfo(patchBuilder: PatchBuilder, checkInInfo: CheckInInfo, staged: boolean = true): Promise<void> {
        const cvsProvider = checkInInfo.cvsProvider;
        const changedFilesNames: CvsLocalResource[] = checkInInfo.cvsLocalResources;
        for (let i: number = 0; i < changedFilesNames.length; i++) {
            await this.appendLocalResource(patchBuilder, changedFilesNames[i], cvsProvider, staged);
        }
    }

    private async appendLocalResource(patchBuilder: PatchBuilder, localResource: CvsLocalResource, cvsProvider: CvsSupportProvider, staged): Promise<void> {
        const status: CvsFileStatusCode = localResource.status;
        switch (status) {
            case CvsFileStatusCode.ADDED : {
                await this.appendAddedFile(patchBuilder, localResource, cvsProvider, staged);
                break;
            }
            case CvsFileStatusCode.DELETED : {
                await this.appendDeletedFile(patchBuilder, localResource);
                break;
            }
            case CvsFileStatusCode.MODIFIED : {
                await this.appendModifiedFile(patchBuilder, localResource, cvsProvider, staged);
                break;
            }
            case CvsFileStatusCode.RENAMED : {
                await this.appendReplacedFile(patchBuilder, localResource, cvsProvider, staged);
                break;
            }
            default : {
                await this.appendDefaultFile(patchBuilder, localResource, cvsProvider, staged);
                break;
            }
        }
    }

    private async appendAddedFile(patchBuilder: PatchBuilder, localResource: CvsLocalResource, cvsProvider: CvsSupportProvider, staged) {
        const absPath: string = localResource.fileAbsPath;
        const fileExist: boolean = await fs_async.exists(absPath);
        const teamcityFileName: string = localResource.serverFilePath;
        if (staged) {
            const fileReadStream: ReadableSet = await this.tryGetStagedFileReadStream(cvsProvider, localResource);
            await patchBuilder.addAddedStreamedFile(teamcityFileName, fileReadStream);
        } else if (fileExist) {
            await patchBuilder.appendAddedFile(teamcityFileName, absPath);
        } else {
            Logger.logError("File not exists either in the staged area either on the disk.");
        }
    }

    private async tryGetStagedFileReadStream(cvsProvider: CvsSupportProvider, localResource: CvsLocalResource) {
        const absPath: string = localResource.fileAbsPath;
        try {
            return await cvsProvider.getStagedFileContentStream(absPath);
        } catch (err) {
            Logger.logError("PatchManager#tryGetStagedFileReadStream: an error occurs during getting showFile stream - use a file content from the file system");
            return undefined;
        }
    }

    private async appendReplacedFile(patchBuilder: PatchBuilder, localResource: CvsLocalResource, cvsProvider: CvsSupportProvider, staged) {
        const prevTcFileName: string = localResource.prevServerFilePath;
        await patchBuilder.addDeletedFile(prevTcFileName);
        await this.appendAddedFile(patchBuilder, localResource, cvsProvider, staged);
    }

    private async appendModifiedFile(patchBuilder: PatchBuilder, localResource: CvsLocalResource, cvsProvider: CvsSupportProvider, staged) {
        const absPath: string = localResource.fileAbsPath;
        const fileExist: boolean = await fs_async.exists(absPath);
        const teamcityFileName: string = localResource.serverFilePath;
        if (staged) {
            const fileReadStream: ReadableSet = await this.tryGetStagedFileReadStream(cvsProvider, localResource);
            await patchBuilder.addReplacedStreamedFile(teamcityFileName, fileReadStream);
        } else if (fileExist) {
            await patchBuilder.addReplacedFile(teamcityFileName, absPath);
        } else {
            Logger.logError("File not exists either in the staged area either on the disk.");
        }
    }

    private async appendDeletedFile(patchBuilder: PatchBuilder, localResource: CvsLocalResource) {
        const teamcityFileName: string = localResource.serverFilePath;
        await patchBuilder.addDeletedFile(teamcityFileName);
    }

    private async appendDefaultFile(patchBuilder: PatchBuilder, localResource: CvsLocalResource, cvsProvider: CvsSupportProvider, staged) {
        const absPath: string = localResource.fileAbsPath;
        const fileExist: boolean = await fs_async.exists(absPath);
        const teamcityFileName: string = localResource.serverFilePath;
        if (staged) {
            const fileReadStream: ReadableSet = await this.tryGetStagedFileReadStream(cvsProvider, localResource);
            await patchBuilder.addAddedStreamedFile(teamcityFileName, fileReadStream);
        } else if (fileExist) {
            await patchBuilder.appendAddedFile(teamcityFileName, absPath);
        } else {
            await patchBuilder.addDeletedFile(teamcityFileName);
        }
    }

    public static async applyPatch(patchAbsPath: string, mappingFileContent: MappingFileContent): Promise<string> {
        const patchFileExists: boolean = await fs_async.exists(patchAbsPath);
        if (!patchFileExists) {
            return;
        }
        fs.open(patchAbsPath, "r", function (err, fd) {
            if (err) {
                throw err;
            }
            let readByteCounter: number = 0;
            const prefixBuffer = new Buffer(1);
            const fileNameLengthBuffer = new Buffer(2);
            const fileLengthBuffer = new Buffer(8);
            fs.readSync(fd, prefixBuffer, 0, 1, 0);
            readByteCounter++;
            while (prefixBuffer[0] === 25 || prefixBuffer[0] === 26 || prefixBuffer[0] === 3) {
                fs.readSync(fd, fileNameLengthBuffer, 0, 2, readByteCounter);
                readByteCounter += 2;
                const fileNameLength = ByteWriter.byteArrayToLong(fileNameLengthBuffer);
                const fileNameBuffer = new Buffer(fileNameLength);
                fs.readSync(fd, fileNameBuffer, 0, fileNameLength, readByteCounter);
                readByteCounter += fileNameLength;
                const relativePath: string = fileNameBuffer.toString().replace(mappingFileContent.tcProjectRootPath, "");
                const absPath: string = path.join(mappingFileContent.localRootPath, relativePath);
                if (prefixBuffer[0] === 26 || prefixBuffer[0] === 25) {
                    fs.readSync(fd, fileLengthBuffer, 0, 8, readByteCounter);
                    readByteCounter += 8;
                    const fileLength = ByteWriter.byteArrayToLong(fileLengthBuffer);
                    const options = {
                        flags: "r",
                        encoding: "utf-8",
                        fd: fd,
                        autoClose: false,
                        start: readByteCounter,
                        end: readByteCounter + fileLength - 1
                    };
                    const readStream: fs.ReadStream = fs.createReadStream(patchAbsPath, options);
                    const writeStream: fs.WriteStream = fs.createWriteStream(absPath);
                    readStream.pipe(writeStream, {end: true});
                    writeStream.on("end", function () {
                        Logger.logDebug(`AsyncWriteStream#writeFile: file was successfully added to the patch`);
                    });
                    readByteCounter += fileLength;
                } else if (prefixBuffer[0] === 3) {
                    fs_async.unlink(absPath);
                } else {
                    console.log(prefixBuffer);
                }
                console.log(prefixBuffer[0] + ": " + absPath);
                fs.readSync(fd, prefixBuffer, 0, 1, readByteCounter);
                readByteCounter++;
            }
        });
    }
}

/**
 * Private class to build a patch from checkIn info
 */
/*private*/
class PatchBuilder {
    private static readonly DELETE_PREFIX: number = 3;
    private static readonly END_OF_PATCH_MARK: number = 10;
    private static readonly RENAME_PREFIX: number = 19;
    private static readonly REPLACE_PREFIX: number = 25;
    private static readonly CREATE_PREFIX: number = 26;
    private _writeSteam: AsyncWriteStream;
    private _patchAbsPath: string;

    constructor() {
        Logger.logDebug(`PatchBuilder#constructor: start construct patch`);
    }

    public init(): Promise<void> {
        Logger.logDebug(`PatchBuilder#init: start construct patch`);
        return new Promise<void>((resolve, reject) => {
            temp.mkdir("VsCode_TeamCity", (err, dirPath) => {
                if (err) {
                    Logger.logError(`PatchBuilder#init: an error occurs during making temp dir: ${VsCodeUtils.formatErrorMessage(err)}`);
                    reject(err);
                }
                const inputPath = path.join(dirPath, `.${VsCodeUtils.uuidv4()}.patch`);
                this._patchAbsPath = inputPath;
                this._writeSteam = new AsyncWriteStream(inputPath);
                Logger.logDebug(`PatchBuilder#init: patchAbsPath is ${inputPath}`);
                resolve();
            });
        });
    }

    /**
     * This method adds to the patch a new file
     * @param tcFileName - fileName at the TeamCity format
     * @param absLocalPath - absolute path to the file in the system
     */
    public async appendAddedFile(tcFileName: string, absLocalPath: string): Promise<void> {
        return this.addFile(tcFileName, absLocalPath, PatchBuilder.CREATE_PREFIX);
    }

    /**
     * This method adds to the patch a new file as a stream
     * @param tcFileName - fileName at the TeamCity format
     * @param readStream - stream with a content of the added file
     */
    public async addAddedStreamedFile(tcFileName: string, readStream: ReadableSet): Promise<void> {
        return this.addStreamedFile(tcFileName, readStream, PatchBuilder.CREATE_PREFIX);
    }

    /**
     * This method adds to the patch an edited file
     * @param tcFileName - fileName at the TeamCity format
     * @param absLocalPath - absolute path to the file in the system
     */
    public async addReplacedFile(tcFileName: string, absLocalPath: string): Promise<void> {
        return this.addFile(tcFileName, absLocalPath, PatchBuilder.REPLACE_PREFIX);
    }

    /**
     * This method adds to the patch a new file as a stream
     * @param tcFileName - fileName at the TeamCity format
     * @param readStream - stream with a content of the added file
     */
    public async addReplacedStreamedFile(tcFileName: string, readStream: ReadableSet): Promise<void> {
        return this.addStreamedFile(tcFileName, readStream, PatchBuilder.REPLACE_PREFIX);
    }

    /**
     * This method adds to the patch any not deleted file
     * @param tcFileName - fileName at the TeamCity format
     * @param absLocalPath - absolute path to the file in the system
     * @param prefix - prefix which specifies the operation, eg. CREATE/REPLACE
     */
    private async addFile(tcFileName: string, absLocalPath: string, prefix: number): Promise<void> {
        try {
            const bytePrefix: Buffer = ByteWriter.writeByte(prefix);
            const byteFileName: Buffer = ByteWriter.writeUTF(tcFileName);
            await this._writeSteam.write(Buffer.concat([bytePrefix, byteFileName]));
            await this._writeSteam.writeFile(absLocalPath);
        } catch (err) {
            Logger.logError(`CustomPatchSender#addFile: an error occurs ${VsCodeUtils.formatErrorMessage(err)}`);
        }
    }

    /**
     * This method adds to the patch any not deleted file
     * @param tcFileName - fileName at the TeamCity format
     * @param readStream - stream with a content of the added file
     * @param prefix - prefix which specifies the operation, eg. CREATE/REPLACE
     */
    private async addStreamedFile(tcFileName: string, readStream: ReadableSet, prefix: number): Promise<void> {
        try {
            const bytePrefix: Buffer = ByteWriter.writeByte(prefix);
            const byteFileName: Buffer = ByteWriter.writeUTF(tcFileName);
            await this._writeSteam.write(Buffer.concat([bytePrefix, byteFileName]));
            await this._writeSteam.writeStreamedFile(readStream);
        } catch (err) {
            Logger.logError(`CustomPatchSender#addFile: an error occurs ${VsCodeUtils.formatErrorMessage(err)}`);
        }
    }

    /**
     * @Deprecated - use addDeletedFile/appendAddedFile instead
     * This method adds to the patch a renamed file
     * @param tcFileName - fileName at the TeamCity format
     * @param prevTcFileName - previous pileName at the TeamCity format
     */
    public async addRenamedFile(tcFileName: string, prevTcFileName: string) {
        try {
            const bytePrefix: Buffer = ByteWriter.writeByte(PatchBuilder.RENAME_PREFIX);
            const byteFileName: Buffer = ByteWriter.writeUTF(tcFileName);
            const bytePrevFileName: Buffer = ByteWriter.writeUTF(prevTcFileName);
            await this._writeSteam.write(Buffer.concat([bytePrefix, bytePrevFileName, byteFileName]));
        } catch (err) {
            Logger.logError(`CustomPatchSender#addDeletedFile: an error occurs ${VsCodeUtils.formatErrorMessage(err)}`);
        }
    }

    /**
     * This method adds to the patch a deleted file
     * @param tcFileName - fileName at the TeamCity format
     */
    public async addDeletedFile(tcFileName: string) {
        try {
            const bytePrefix: Buffer = ByteWriter.writeByte(PatchBuilder.DELETE_PREFIX);
            const byteFileName: Buffer = ByteWriter.writeUTF(tcFileName);
            await this._writeSteam.write(Buffer.concat([bytePrefix, byteFileName]));
        } catch (err) {
            Logger.logError(`CustomPatchSender#addDeletedFile: an error occurs ${VsCodeUtils.formatErrorMessage(err)}`);
        }
    }

    /**
     * The final stage of a patch building:
     * - add eof mark
     * - dispose writeStream
     * @return absPath of the patch
     */
    public async finishPatching(): Promise<string> {
        try {
            const byteEOPMark: Buffer = ByteWriter.writeByte(PatchBuilder.END_OF_PATCH_MARK);
            const byteEmptyLine: Buffer = ByteWriter.writeUTF("");
            await this._writeSteam.write(Buffer.concat([byteEOPMark, byteEmptyLine]));
            this._writeSteam.dispose();
        } catch (err) {
            Logger.logError(`CustomPatchSender#finishPatching: an error occurs ${VsCodeUtils.formatErrorMessage(err)}`);
        }

        Logger.logInfo(`CustomPatchSender#finishPatching: patch absPath is ${this._patchAbsPath}`);
        return this._patchAbsPath;
    }
}
