"use strict";

import * as fs from "fs";
import * as path from "path";
import { Logger } from "../utils/logger";
import { ByteWriter } from "../utils/bytewriter";
import { VsCodeUtils } from "../utils/vscodeutils";
import { CvsFileStatusCode } from "../utils/constants";
import { FileController } from "../utils/filecontroller";
import { CvsLocalResource } from "../entities/leaveitems";
import { AsyncWriteStream } from "../entities/writestream";
import { CvsSupportProvider } from "../remoterun/cvsprovider";
import { CheckinInfo, MappingFileContent, ReadableSet } from "../utils/interfaces";
const temp = require("temp").track();

export class PatchManager {
    static _cvsProvider : any;
    /**
     * This method uses PatchBuilder to write all required info into the patch file
     * @param cvsProvider - CvsProvider object
     * @param staged - boolean, if true it tries to get fileContent from #gitShow firstly
     * @return Promise<string> - absPath of the patch
     */
    public static async preparePatch(cvsProvider : CvsSupportProvider, mappingFileContent : MappingFileContent, staged : boolean = true) : Promise<string> {
        const checkInInfo : CheckinInfo = await cvsProvider.getRequiredCheckinInfo();
        PatchManager._cvsProvider = cvsProvider;
        const changedFilesNames : CvsLocalResource[] = checkInInfo.cvsLocalResources;
        if (!changedFilesNames) {
            return;
        }
        const configFileContent : MappingFileContent = await cvsProvider.generateMappingFileContent();
        const patchBuilder : PatchBuilder = new PatchBuilder();
        await patchBuilder.init();
        //It's impossible to use forEach loop with await calls
        for (let i : number = 0; i < changedFilesNames.length; i++) {
            const absPath : string = changedFilesNames[i].fileAbsPath;
            const status : CvsFileStatusCode = changedFilesNames[i].status;
            const relPath : string = path.relative(configFileContent.localRootPath, absPath).replace(/\\/g, "/");
            const fileExist : boolean = await FileController.exists(absPath);
            const teamcityFileName : string = `${configFileContent.tcProjectRootPath}/${relPath}`;
            let fileReadStream : ReadableSet | undefined;
            //When fileReadStream !== undefined we should use the stream.
            try {
                fileReadStream = staged ? await cvsProvider.showFile(absPath) : undefined;
            } catch (err) {
                //An error message should be already logged at the #showFile
                Logger.logError("PatchManager#preparePatch: an error occurs during getting showFile stream - use a file content from the file system");
            }
            switch (status) {
                //TODO: Implement replaced status code
                case CvsFileStatusCode.ADDED : {
                    if (!fileReadStream && fileExist) {
                        await patchBuilder.addAddedFile(teamcityFileName, absPath);
                    } else if (fileReadStream) {
                        await patchBuilder.addAddedStreamedFile(teamcityFileName, fileReadStream);
                    } //TODO: add logs if not
                    break;
                }
                case CvsFileStatusCode.DELETED : {
                    await patchBuilder.addDeletedFile(teamcityFileName);
                    break;
                }
                case CvsFileStatusCode.MODIFIED : {
                    if (!fileReadStream && fileExist) {
                        await patchBuilder.addReplacedFile(teamcityFileName, absPath);
                    } else if (fileReadStream) {
                        await patchBuilder.addReplacedStreamedFile(teamcityFileName, fileReadStream);
                    } //TODO: add logs if not
                    break;
                }
                case CvsFileStatusCode.RENAMED : {
                    const prevAbsPath : string = changedFilesNames[i].prevFileAbsPath;
                    const prevRelPath : string = path.relative(configFileContent.localRootPath, prevAbsPath).replace(/\\/g, "/");
                    const prevTcFileName : string = `${configFileContent.tcProjectRootPath}/${prevRelPath}`;
                    await patchBuilder.addDeletedFile(prevTcFileName);
                    if (fileExist) {
                        if (!fileReadStream && fileExist) {
                            await patchBuilder.addAddedFile(teamcityFileName, absPath);
                        } else if (fileReadStream) {
                            await patchBuilder.addAddedStreamedFile(teamcityFileName, fileReadStream);
                        } //TODO: add logs if not
                    }
                    break;
                }
                default : {
                    if (!fileReadStream && fileExist) {
                        await patchBuilder.addReplacedFile(teamcityFileName, absPath);
                    } else if (fileReadStream) {
                        await patchBuilder.addReplacedStreamedFile(teamcityFileName, fileReadStream);
                    } else {
                        await patchBuilder.addDeletedFile(teamcityFileName);
                    }
                    break;
                }
            }
        }
        return patchBuilder.finishPatching();
    }

    public static async applyPatch(patchAbsPath : string, mappingFileContent : MappingFileContent) : Promise<CvsLocalResource[]> {
        const patchFileExists : boolean = await FileController.exists(patchAbsPath);
        if (!patchFileExists) {
            return [];
        }
        const appliedResources : CvsLocalResource[] = [];
        const prefixBuffer = new Buffer(1);
        const fileNameLengthBuffer = new Buffer(2);
        const fileLengthBuffer = new Buffer(8);
        const prom : Promise<number> = new Promise((resolve, reject) => {
            fs.open(patchAbsPath, "r", function(err, fd) {
                if (err) {
                    reject(err);
                }
                resolve(fd);
            });
        });
        let fd : number;
        try {
            fd = await prom;
        } catch (err) {
            Logger.logError(`PatchManager#applyPatch: an error occurs during openning patch file ${VsCodeUtils.formatErrorMessage(err)}`);
            throw new Error(`PatchManager#applyPatch: an error occurs during openning patch file`);
        }

        /* Read Prefix */
        fs.readSync(fd, prefixBuffer, 0, 1, 0);
        let patchPrefix : number = prefixBuffer[0];
        let readByteCounter : number = 1;

        while (true) {
            if (patchPrefix === PatchPrefix.eof) {
                Logger.logInfo("PatchManager#applyPatch: Patch was successfully applied");
                break;
            } else if ([PatchPrefix.created, PatchPrefix.modified, PatchPrefix.deleted].indexOf(patchPrefix) === -1) {
                Logger.logWarning(`PatchManager#applyPatch: Unexpected file modification prefix: ${patchPrefix}. Applying of patch is broken.`);
                break;
            }

            /* Read File Name Length */
            fs.readSync(fd, fileNameLengthBuffer, 0, 2, readByteCounter);
            readByteCounter += 2;
            const fileNameLength : number = ByteWriter.byteArrayToLong(fileNameLengthBuffer);

            /* Read File Name */
            const fileNameBuffer = new Buffer(fileNameLength);
            fs.readSync(fd, fileNameBuffer, 0, fileNameLength, readByteCounter);
            readByteCounter += fileNameLength;
            const tcFileName : string = fileNameBuffer.toString();

            /* Get File Abs Path */
            const relativePath : string = fileNameBuffer.toString().replace(mappingFileContent.tcProjectRootPath, "");
            const absPath : string = path.join(mappingFileContent.localRootPath, relativePath);
            switch (patchPrefix) {
                case(PatchPrefix.created):
                //There should be the same behaviour as in case of modified prefix
                // tslint:disable-next-line:no-switch-case-fall-through
                case(PatchPrefix.modified): {
                    /* Read File Content Length */
                    fs.readSync(fd, fileLengthBuffer, 0, 8, readByteCounter);
                    readByteCounter += 8;
                    const fileLength : number = ByteWriter.byteArrayToLong(fileLengthBuffer);

                    /* Transfer particular file content from patch to destination file */
                    const options = {
                        flags: "r",
                        encoding: "utf-8",
                        fd: fd,
                        autoClose: false,
                        start: readByteCounter,
                        end: readByteCounter + fileLength - 1
                    };
                    const readStream : fs.ReadStream = fs.createReadStream(patchAbsPath, options);
                    const writeStream : fs.WriteStream = fs.createWriteStream(absPath);
                    readStream.pipe(writeStream, {end: true});
                    readByteCounter += fileLength;
                    const prom : Promise<{}> = new Promise ((resolve, reject) => {
                        writeStream.on("finish", function() {
                            resolve();
                        });
                        writeStream.on("error", function() {
                            reject();
                        });
                    });
                    try {
                        await prom;
                        Logger.logDebug(`PatchManager#applyPatch: file ${absPath} was successfully transfered from the patch`);
                    } catch (err) {
                        Logger.logError(`PatchManager#applyPatch: an error occurs during transfering from the patch file ${VsCodeUtils.formatErrorMessage(err)}`);
                        throw new Error(`PatchManager#applyPatch: an error occurs during transfering from the patch file`);
                    }

                    /* Add resource to the appliedResources colection */
                    appliedResources.push(new CvsLocalResource(CvsFileStatusCode.ADDED, absPath, relativePath));
                    break;
                }
                case (PatchPrefix.deleted): {
                    try {
                        //await FileController.removeFileAsync(absPath);
                        Logger.logDebug(`PatchManager#applyPatch: file ${absPath} was successfully deleted`);
                    } catch (err) {
                        Logger.logError(`PatchManager#applyPatch: an error occurs during deleting the file ${VsCodeUtils.formatErrorMessage(err)}`);
                        throw new Error(`PatchManager#applyPatch: an error occurs during deleting a file`);
                    }
                    /* Add resource to the appliedResources colection */
                    appliedResources.push(new CvsLocalResource(CvsFileStatusCode.DELETED, absPath, relativePath));
                    break;
                }
            }

            /* Read Prefix */
            fs.readSync(fd, prefixBuffer, 0, 1, readByteCounter);
            patchPrefix = prefixBuffer[0];
            readByteCounter++;
        }
        fs.close(fd, (err) => {
            if (err) {
                Logger.logError(`PatchManager#applyPatch: an error occurs during closing patch file: ${VsCodeUtils.formatErrorMessage(err)}`);
            }
        });
        return appliedResources;
    }
}

/**
 * Private class to build a patch from checkin info
 */
class PatchBuilder {
    private readonly _bufferArray : Buffer[];
    private _writeSteam : AsyncWriteStream;
    private _patchAbsPath : string;

    constructor() {
        Logger.logDebug(`PatchBuilder#constructor: start constract patch`);
        this._bufferArray = [];
    }

    public init() : Promise<void> {
        Logger.logDebug(`PatchBuilder#init: start constract patch`);
        const prom : Promise<void> = new Promise((resolve, reject) => {
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
        return prom;
    }

    /**
     * This method adds to the patch a new file
     * @param tcFileName - fileName at the TeamCity format
     * @param absLocalPath - absolute path to the file in the system
     */
    public async addAddedFile(tcFileName: string, absLocalPath : string) : Promise<void> {
        return this.addFile(tcFileName, absLocalPath, PatchPrefix.created);
    }

    /**
     * This method adds to the patch a new file as a stream
     * @param tcFileName - fileName at the TeamCity format
     * @param readStream - stream with a content of the added file
     */
    public async addAddedStreamedFile(tcFileName: string, readStream : ReadableSet) : Promise<void> {
        return this.addStreamedFile(tcFileName, readStream, PatchPrefix.created);
    }

    /**
     * This method adds to the patch an edited file
     * @param tcFileName - fileName at the TeamCity format
     * @param absLocalPath - absolute path to the file in the system
     */
    public async addReplacedFile(tcFileName: string, absLocalPath : string) : Promise<void> {
        return this.addFile(tcFileName, absLocalPath, PatchPrefix.modified);
    }

    /**
     * This method adds to the patch a new file as a stream
     * @param tcFileName - fileName at the TeamCity format
     * @param readStream - stream with a content of the modified file
     */
    public async addReplacedStreamedFile(tcFileName: string, readStream : ReadableSet) : Promise<void> {
        return this.addStreamedFile(tcFileName, readStream, PatchPrefix.modified);
    }

    /**
     * This method adds to the patch any not deleted file
     * @param tcFileName - fileName at the TeamCity format
     * @param absLocalPath - absolute path to the file in the system
     * @param prefix - prefix which specifies the operation, eg. CREATE/REPLACE
     */
    private async addFile(tcFileName: string, absLocalPath : string, prefix : number) : Promise<void> {
        try {
            const bytePrefix : Buffer = ByteWriter.writeByte(prefix);
            const byteFileName : Buffer = ByteWriter.writeUTF(tcFileName);
            await this._writeSteam.write(Buffer.concat([bytePrefix, byteFileName]));
            await this._writeSteam.writeFile(absLocalPath);
        } catch (err) {
            Logger.logError(`CustomPatchSender#addFile: an error occurs ${VsCodeUtils.formatErrorMessage(err)}`);
        }
    }

    /**
     * This method adds to the patch any not deleted file as a stream
     * @param tcFileName - fileName at the TeamCity format
     * @param readStream - stream with a content of the file
     * @param prefix - prefix which specifies the operation, eg. CREATE/REPLACE
     */
    private async addStreamedFile(tcFileName: string, readStream : ReadableSet, prefix : number) : Promise<void> {
        try {
            const bytePrefix : Buffer = ByteWriter.writeByte(prefix);
            const byteFileName : Buffer = ByteWriter.writeUTF(tcFileName);
            await this._writeSteam.write(Buffer.concat([bytePrefix, byteFileName]));
            await this._writeSteam.writeStreamedFile(readStream);
        } catch (err) {
            Logger.logError(`CustomPatchSender#addFile: an error occurs ${VsCodeUtils.formatErrorMessage(err)}`);
        }
    }

     /**
     * This method adds to the patch a renamed file
     * @param tcFileName - fileName at the TeamCity format
     */
    public async addRenamedFile(tcFileName: string, prevTcFileName: string) {
        try {
            const bytePrefix : Buffer = ByteWriter.writeByte(PatchPrefix.rename);
            const byteFileName : Buffer = ByteWriter.writeUTF(tcFileName);
            const bytePrevFileName : Buffer = ByteWriter.writeUTF(prevTcFileName);
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
            const bytePrefix : Buffer = ByteWriter.writeByte(PatchPrefix.deleted);
            const byteFileName : Buffer = ByteWriter.writeUTF(tcFileName);
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
    public async finishPatching() : Promise<string> {
        try {
            const byteEOPMark : Buffer = ByteWriter.writeByte(PatchPrefix.eof);
            const byteEmptyLine : Buffer = ByteWriter.writeUTF("");
            await this._writeSteam.write(Buffer.concat([byteEOPMark, byteEmptyLine]));
            this._writeSteam.dispose();
        } catch (err) {
            Logger.logError(`CustomPatchSender#finishPatching: an error occurs ${VsCodeUtils.formatErrorMessage(err)}`);
        }

        Logger.logInfo(`CustomPatchSender#finishPatching: patch absPath is ${this._patchAbsPath}`);
        return this._patchAbsPath;
    }
}

class PatchPrefix {
    public static readonly deleted : number = 3;
    public static readonly eof : number = 10;
    public static readonly rename : number = 19;
    public static readonly modified : number = 25;
    public static readonly created : number = 26;
}
