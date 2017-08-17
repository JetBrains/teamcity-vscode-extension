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
import { CheckinInfo, MappingFileContent } from "../utils/interfaces";
const temp = require("temp").track();

export class PatchManager {
    static _cvsProvider : any;
    /**
     * This method uses PatchBuilder to write all required info into the patch file
     * @param cvsProvider - CvsProvider object
     * @return Promise<string> - absPath of the patch
     */
    public static async preparePatch(cvsProvider : CvsSupportProvider, isForStaged : boolean = true) : Promise<string> {
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
            switch (status) {
                //TODO: Implement replaced status code
                case CvsFileStatusCode.ADDED : {
                    if (fileExist) {
                        await patchBuilder.addAddedFile(teamcityFileName, absPath);
                    } //TODO: add logs if not
                    break;
                }
                case CvsFileStatusCode.DELETED : {
                    await patchBuilder.addDeletedFile(teamcityFileName);
                    break;
                }
                case CvsFileStatusCode.MODIFIED : {
                    if (fileExist) {
                        await patchBuilder.addReplacedFile(teamcityFileName, absPath);
                    } //TODO: add logs if not
                    break;
                }
                case CvsFileStatusCode.RENAMED : {
                    const prevAbsPath : string = changedFilesNames[i].prevFileAbsPath;
                    const prevRelPath : string = path.relative(configFileContent.localRootPath, prevAbsPath).replace(/\\/g, "/");
                    const prevTcFileName : string = `${configFileContent.tcProjectRootPath}/${prevRelPath}`;
                    await patchBuilder.addDeletedFile(prevTcFileName);
                    if (fileExist) {
                        await patchBuilder.addAddedFile(teamcityFileName, absPath);
                    }
                    break;
                }
                default : {
                    if (fileExist) {
                        await patchBuilder.addReplacedFile(teamcityFileName, absPath);
                    } else {
                        await patchBuilder.addDeletedFile(teamcityFileName);
                    }
                    break;
                }
            }
        }
        return patchBuilder.finishPatching();
    }

    public static async applyPatch(patchAbsPath : string, mappingFileContent : MappingFileContent) : Promise<string> {
        const patchFileExists : boolean = await FileController.exists(patchAbsPath);
        if (!patchFileExists) {
            return;
        }

        fs.open(patchAbsPath, "r", function(err, fd) {
            if (err) {
                throw err;
            }
            let readByteCounter : number = 0;
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
                const relativePath : string = fileNameBuffer.toString().replace(mappingFileContent.tcProjectRootPath, "");
                const absPath : string = path.join(mappingFileContent.localRootPath, relativePath);
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
                    const readStream : fs.ReadStream = fs.createReadStream(patchAbsPath, options);
                    const writeStream : fs.WriteStream = fs.createWriteStream(absPath);
                    readStream.pipe(writeStream, {end: true});
                    writeStream.on("end", function() {
                        Logger.logDebug(`AsyncWriteStream#writeFile: file was successfully added to the patch`);
                    });
                    readByteCounter += fileLength;
                } else if (prefixBuffer[0] === 3) {
                    FileController.removeFileAsync(absPath);
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

function copyData(savPath, srcPath) {
    fs.readFile(srcPath, "utf8", function (err, data) {
            if (err) {
                throw err;
            }
            //Do your processing, MD5, send a satellite to the moon, etc.
            fs.writeFile (savPath, data, function(err) {
                if (err) {
                    throw err;
                }
                console.log("complete");
            });
        });
}

/**
 * Private class to build a patch from checkin info
 */
class PatchBuilder {
    private readonly _bufferArray : Buffer[];
    private static readonly DELETE_PREFIX : number = 3;
    private static readonly END_OF_PATCH_MARK : number = 10;
    private static readonly RENAME_PREFIX : number = 19;
    private static readonly REPLACE_PREFIX : number = 25;
    private static readonly CREATE_PREFIX : number = 26;
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
                    Logger.logError(`PatchBuilder#init: an error occurs during making temp dir:
                                    ${VsCodeUtils.formatErrorMessage(err)}`);
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
        return this.addFile(tcFileName, absLocalPath, PatchBuilder.CREATE_PREFIX);
    }

    /**
     * This method adds to the patch an edited file
     * @param tcFileName - fileName at the TeamCity format
     * @param absLocalPath - absolute path to the file in the system
     */
    public async addReplacedFile(tcFileName: string, absLocalPath : string) : Promise<void> {
        return this.addFile(tcFileName, absLocalPath, PatchBuilder.REPLACE_PREFIX);
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
     * This method adds to the patch a renamed file
     * @param tcFileName - fileName at the TeamCity format
     */
    public async addRenamedFile(tcFileName: string, prevTcFileName: string) {
        try {
            const bytePrefix : Buffer = ByteWriter.writeByte(PatchBuilder.RENAME_PREFIX);
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
            const bytePrefix : Buffer = ByteWriter.writeByte(PatchBuilder.DELETE_PREFIX);
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
            const byteEOPMark : Buffer = ByteWriter.writeByte(PatchBuilder.END_OF_PATCH_MARK);
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
