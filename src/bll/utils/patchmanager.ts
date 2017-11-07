"use strict";

import * as path from "path";
import {Logger} from "./logger";
import {ByteWriter} from "./bytewriter";
import {VsCodeUtils} from "./vscodeutils";
import {AsyncWriteStream} from "../../dal/asyncwritestream";
import {CvsSupportProvider} from "../../dal/cvsprovider";
import {CheckInInfo} from "../entities/checkininfo";
import {CvsResource} from "../entities/cvsresources/cvsresource";
import {ReadableSet} from "./readableset";
import {injectable} from "inversify";
import {ReplacedCvsResource} from "../entities/cvsresources/replacedcvsresource";
import {DeletedCvsResource} from "../entities/cvsresources/deletedcvsresource";
const temp = require("temp").track();

@injectable()
export class PatchManager {

    public async preparePatch(checkInArray: CheckInInfo[]): Promise<string> {
        if (!checkInArray && checkInArray.length === 0) {
            return;
        }
        const patchBuilder: PatchBuilder = new PatchBuilder();
        await patchBuilder.startPatching();
        for (let i = 0; i < checkInArray.length; i++) {
            const checkInInfo = checkInArray[i];
            await this.appendCheckInInfo(patchBuilder, checkInInfo);
        }
        return patchBuilder.finishPatching();
    }

    private async appendCheckInInfo(patchBuilder: PatchBuilder, checkInInfo: CheckInInfo): Promise<void> {
        const cvsProvider = checkInInfo.cvsProvider;
        const cvsResources: CvsResource[] = checkInInfo.cvsLocalResources;
        for (let i: number = 0; i < cvsResources.length; i++) {
            const cvsResource: CvsResource = cvsResources[i];
            await patchBuilder.appendCvsResource(cvsProvider, cvsResource);
        }
    }
}

class PatchBuilder {
    private static readonly END_OF_PATCH_MARK: number = 10;
    private writeSteam: AsyncWriteStream;
    private patchAbsPath: string;

    constructor() {
        Logger.logDebug(`PatchBuilder#constructor: start construct patch`);
    }

    public startPatching(): Promise<void> {
        Logger.logDebug(`PatchBuilder#init: start construct patch`);
        return new Promise<void>((resolve, reject) => {
            temp.mkdir("VsCode_TeamCity", (err, dirPath) => {
                if (err) {
                    Logger.logError(`PatchBuilder#init: an error occurs during making temp dir: ${VsCodeUtils.formatErrorMessage(err)}`);
                    reject(err);
                }
                const inputPath = path.join(dirPath, `.${VsCodeUtils.uuidv4()}.patch`);
                this.patchAbsPath = inputPath;
                this.writeSteam = new AsyncWriteStream(inputPath);
                Logger.logDebug(`PatchBuilder#init: patchAbsPath is ${inputPath}`);
                resolve();
            });
        });
    }

    public async appendCvsResource(cvsProvider: CvsSupportProvider, cvsResource: CvsResource): Promise<void> {
        await this.appendHeaderForResource(cvsResource);
        await this.appendResourceContent(cvsProvider, cvsResource);

        if (cvsResource instanceof ReplacedCvsResource) {
            await this.appendReplacedFileAsRemoved(cvsProvider, cvsResource);
        }
    }

    private async appendHeaderForResource(cvsResource: CvsResource): Promise<void> {
        const header: Buffer = cvsResource.getHeaderForPatch();
        await this.writeSteam.write(header);
    }

    private async appendResourceContent(cvsProvider: CvsSupportProvider, cvsResource: CvsResource): Promise<void> {
        if (cvsResource instanceof DeletedCvsResource) {
            return;
        }
        let fileContentStream: ReadableSet;
        if (cvsProvider.allowStaging()) {
            fileContentStream = await cvsProvider.getStagedFileContentStream(cvsResource);
        } else {
            fileContentStream = await cvsResource.getContentForPatch();
        }
        if (fileContentStream) {
            await this.writeSteam.writeStreamedFile(fileContentStream);
        }
    }

    private async appendReplacedFileAsRemoved(cvsProvider: CvsSupportProvider, cvsResource: CvsResource) {
        const label: string = "";
        const removedResource: CvsResource = new DeletedCvsResource(cvsResource.prevFileAbsPath, label);
        removedResource.serverFilePath = cvsResource.prevServerFilePath;
        return this.appendCvsResource(cvsProvider, removedResource);
    }

    /**
     * @return absPath of the patch file.
     */
    public async finishPatching(): Promise<string> {
        try {
            await this.appendEofMark();
            this.writeSteam.dispose();
        } catch (err) {
            Logger.logError(`CustomPatchSender#finishPatching: an error occurs ${VsCodeUtils.formatErrorMessage(err)}`);
        }

        Logger.logInfo(`CustomPatchSender#finishPatching: patch absPath is ${this.patchAbsPath}`);
        return this.patchAbsPath;
    }

    private async appendEofMark(): Promise<void> {
        const emptyString: string = "";
        const byteEOPMark: Buffer = ByteWriter.writeByte(PatchBuilder.END_OF_PATCH_MARK);
        const byteEmptyLine: Buffer = ByteWriter.writeUTF(emptyString);
        await this.writeSteam.write(Buffer.concat([byteEOPMark, byteEmptyLine]));
    }

}
