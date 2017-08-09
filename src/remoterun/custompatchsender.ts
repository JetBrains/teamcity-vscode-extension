"use strict";
import { PatchSender } from "../remoterun/patchsender";
import { XmlRpcProvider } from "../utils/xmlrpcprovider";
import { FileController } from "../utils/filecontroller";
import { ByteWriter } from "../utils/bytewriter";
import { VsCodeUtils } from "../utils/vscodeutils";
import { Constants } from "../utils/constants";
import { Credential } from "../credentialstore/credential";
import { BuildConfigItem } from "../remoterun/configexplorer";
import { CvsSupportProvider } from "../remoterun/cvsprovider";
import { CheckinInfo, MappingFileContent } from "../utils/interfaces";
import * as path from "path";

export class CustomPatchSender extends XmlRpcProvider implements PatchSender {

    /**
     * @returns true in case of success, otherwise false.
     */
    public async remoteRun(creds: Credential, configs: BuildConfigItem[], cvsProvider: CvsSupportProvider): Promise<boolean> {
        //We might not have userId at the moment
        if (!creds.userId) {
            await this.authenticateIfRequired(creds);
        }

        const patch : Buffer = await this.preparePatch(cvsProvider);
        const additionalArgs : string[] = [];
        const checkInInfo : CheckinInfo = await cvsProvider.getRequiredCheckinInfo();
        additionalArgs.push(`userId=${creds.userId}`);
        additionalArgs.push(`description="${checkInInfo.message}"`);
        additionalArgs.push(`commitType=0`); // commitType is remote run
        const patchDestinationUrl : string = `${creds.serverURL}/uploadChanges.html`;
        try {
            const changeListId : string = await VsCodeUtils.makeRequest(Constants.POST_METHOD,
                                                                        patchDestinationUrl,
                                                                        creds,
                                                                        patch,
                                                                        additionalArgs);
            const errors : string = await this.triggerChangeList(changeListId, configs, creds);
        } catch (err) {
            console.log(VsCodeUtils.formatErrorMessage(err));
            return false;
        }
        return true;
    }

    /**
     * This method uses PatchBuilder to write all required info into the patch file
     * @param cvsProvider - CvsProvider object
     * @return Promise<Buffer> of patch content
     */
    public async preparePatch(cvsProvider : CvsSupportProvider) : Promise<Buffer> {
        const checkInInfo : CheckinInfo = await cvsProvider.getRequiredCheckinInfo();
        const changedFilesNames : string[] = checkInInfo.fileAbsPaths;
        if (!changedFilesNames) {
            return;
        }
        const configFileContent : MappingFileContent = await cvsProvider.generateMappingFileContent();
        const patchBuilder : PatchBuilder = new PatchBuilder();

        //We can't use forEach loop with await calls
        for (let i : number = 0; i < changedFilesNames.length; i++) {
            //const fileName : string = changedFilesNames[i];
            const absPath : string = changedFilesNames[i];
            const relPath : string = path.relative(configFileContent.localRootPath, absPath).replace(/\\/g, "/");
            const fileExist : boolean = await FileController.exists(absPath);
            const teamcityFileName : string = `${configFileContent.tcProjectRootPath}/${relPath}`;
            if (fileExist) {
                patchBuilder.addReplacedFile(teamcityFileName, absPath);
            } else {
                patchBuilder.addDeletedFile(teamcityFileName);
            }
        }

        return patchBuilder.getPatch();
    }

    /**
     * @param changeListId - id of change list to trigger
     * @param buildConfigs - all build configs, which should be triggered
     * @param creds - user credentials
     */
    public async triggerChangeList( changeListId : string,
                                    buildConfigs : BuildConfigItem[],
                                    creds : Credential) : Promise<string> {
        if (!buildConfigs) {
            return;
        }
        await this.authenticateIfRequired(creds);
        if (this.client.getCookie(Constants.XMLRPC_SESSIONID_KEY) === undefined) {
           throw new Error("Something went wrong. Try to signin again.");
        }
        const addToQueueRequests = [];
        buildConfigs.forEach((build) => {
            addToQueueRequests.push(`<AddToQueueRequest>
                <changeListId>${changeListId}</changeListId>
                <buildTypeId>${build.id}</buildTypeId>
                <myPutBuildOnTheQueueTop>false</myPutBuildOnTheQueueTop>
                <myRebuildDependencies>false</myRebuildDependencies>
                <myCleanSources>false</myCleanSources>
                </AddToQueueRequest>`);
        });

        const triggedBy = `##userId='${creds.userId}' IDEPlugin='VsCode Plagin'`;
        const prom : Promise<string> = new Promise((resolve, reject) => {
            this.client.methodCall("RemoteBuildServer2.addToQueue", [ addToQueueRequests, triggedBy ], function (err, result) {
                /* tslint:disable-next-line:no-null-keyword */
                if (err !== null) {
                   return reject(err);
                }
                resolve(result);
            });
        });
        return prom;
    }

}

/**
 * Private class to build a patch from checkin info
 */
class PatchBuilder {
    private readonly _bufferArray : Buffer[];
    private static readonly DELETE_PREFIX : number = 3;
    private static readonly REPLACE_PREFIX : number = 25;
    private static readonly END_OF_PATCH_MARK : number = 10;
    constructor() {
        this._bufferArray = [];
    }

    /**
     * This method adds to the patch any not deleted file
     * @param tcFileName - fileName at the TeamCity format
     * @param absLocalPath - absolute path to the file in the system
     */
    public async addReplacedFile(tcFileName: string, absLocalPath : string) {
        try {
            const bytePrefix : Buffer = ByteWriter.writeByte(PatchBuilder.REPLACE_PREFIX);
            const byteFileName : Buffer = ByteWriter.writeUTF(tcFileName);
            const byteFileContent : Buffer = await ByteWriter.writeFile(absLocalPath);

            this._bufferArray.push(bytePrefix);
            this._bufferArray.push(byteFileName);
            this._bufferArray.push(byteFileContent);
        } catch (err) {
            //TODO: WRITE TO THE LOG SMT SCARY
        }
    }

    /**
     * This method adds to the patch a deleted file
     * @param tcFileName - fileName at the TeamCity format
     */
    public addDeletedFile(tcFileName: string) {
        try {
            const bytePrefix : Buffer = ByteWriter.writeByte(PatchBuilder.DELETE_PREFIX);
            const byteFileName : Buffer = ByteWriter.writeUTF(tcFileName);

            this._bufferArray.push(bytePrefix);
            this._bufferArray.push(byteFileName);
        } catch (err) {
            //TODO: WRITE TO THE LOG SMT SCARY
        }
    }

    /**
     * The final stage of a patch building - add eof mark and return all the patch content as Buffer object
     */
    public getPatch() : Buffer {
        const byteEOPMark : Buffer = ByteWriter.writeByte(PatchBuilder.END_OF_PATCH_MARK);
        const byteEmptyLine : Buffer = ByteWriter.writeUTF("");
        this._bufferArray.push(byteEOPMark);
        this._bufferArray.push(byteEmptyLine);
        return Buffer.concat(this._bufferArray);
    }

}
