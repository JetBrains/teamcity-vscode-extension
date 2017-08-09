"use strict";

import * as path from "path";
import * as cp from "child-process-promise";
import { Credential } from "../credentialstore/credential";
import { FileController } from "../utils/filecontroller";
import { CheckinInfo, MappingFileContent } from "../utils/interfaces";
import { VsCodeUtils } from "../utils/vscodeutils";
import { Logger } from "../utils/logger";
import { BuildConfigItem } from "./configexplorer";
import { CvsSupportProvider } from "./cvsprovider";
import { workspace, SourceControlResourceState } from "vscode";

export interface PatchSender {
    /**
     * @returns true in case of success, otherwise false.
     */
    /* async */ remoteRun(cred : Credential, configs : BuildConfigItem[], cvsProvider : CvsSupportProvider) : Promise<boolean>;
}

/**
 * Implementation of PatchSender that is required tcc.jar util.
 */
//TODO: Think of situation, when two builds starts parallely.
//Maybe we should implement creating unique config file name.
export class TccPatchSender implements PatchSender {

    /**
     * @returns true in case of success, otherwise false.
     */
    public async remoteRun(cred : Credential, configs : BuildConfigItem[], cvsProvider : CvsSupportProvider) : Promise<boolean> {
        const tccPath : string = `${path.join(__dirname, "..", "..", "..", "resources", "tcc.jar")}`.trim();
        if (!FileController.exists(tccPath)) {
            Logger.logError("TccPatchSender#remoteRun: the tcc util is not found");
            VsCodeUtils.displayNoTccUtilMessage();
            return false;
        }

        /* Step 1. Sending login request by the tcc.jar util. */
        try {
            const tccLoginCommand : string = `java -jar "${tccPath}" login --host ${cred.serverURL} --user ${cred.user} --password ${cred.pass}`;
            await cp.exec(tccLoginCommand);
        }catch (err) {
            Logger.logError("TccPatchSender#remoteRun: unexpected error during sending login request by the tcc.jar util: " + VsCodeUtils.formatErrorMessage(err));
            VsCodeUtils.showErrorMessage("Unexpected error during sending login request by the tcc.jar util");
            return false;
        }
        Logger.logDebug("TccPatchSender#remoteRun: step 1 was passed");
        /* Step 2. Creating a config file for the tcc.jar util. */
        const configFileAbsPath : string = path.join(__dirname, "..", "..", "..", "resources", `.teamcity-mappings.${VsCodeUtils.uuidv4()}.properties`);
        try {
            const mappingFileContent : MappingFileContent = await cvsProvider.generateMappingFileContent();
            await FileController.createFileAsync(configFileAbsPath, mappingFileContent.fullContent);
        }catch (err) {
            Logger.logError("TccPatchSender#remoteRun: unexpected error during creating a config file for the tcc.jar util: " + VsCodeUtils.formatErrorMessage(err));
            VsCodeUtils.showErrorMessage("Unexpected error during creating a config file for the tcc.jar util");
            return false;
        }
        Logger.logDebug("TccPatchSender#remoteRun: step 2 was passed");
        /* Step 3. Preparing arguments and executing the tcc.jat util. */
        try {
            const configListAsString : string = this.configArray2String(configs);
            const checkInInfo : CheckinInfo = await cvsProvider.getRequiredCheckinInfo();
            const filePathsAsString : string = this.filePaths2String(checkInInfo.fileAbsPaths);
            const runBuildCommand : string = `java -jar "${tccPath}" run --host ${cred.serverURL} -m "${checkInInfo.message}" -c ${configListAsString} ${filePathsAsString} --config-file "${configFileAbsPath}"`;
            const prom = await cp.exec(runBuildCommand);
            if (prom.stdout) {
                const lines : string[] = prom.stdout.toString("utf8").trim().split("\n");
                VsCodeUtils.showInfoMessage(`[TeamCity] ${lines[lines.length - 1]}`);
            }
        }catch (err) {
            if (err.stderr) {
                const lines : string[] = err.stderr.trim().split("\n");
                VsCodeUtils.showWarningMessage(`[TeamCity] ${lines[lines.length - 1]}`);
            } else {
                Logger.logError("TccPatchSender#remoteRun: unexpected error during preparing arguments and executing the tcc.jar util: " + VsCodeUtils.formatErrorMessage(err));
                VsCodeUtils.showErrorMessage("Unexpected error during preparing arguments and executing the tcc.jar util");
            }
            return false;
        }
        Logger.logDebug("TccPatchSender#remoteRun: step 3 was passed");
        /* Step 4. Removing the config file for the tcc.jar util.*/
        try {
            await FileController.removeFileAsync(configFileAbsPath);
        }catch (err) {
            Logger.logError("TccPatchSender#remoteRun: unexpected error during removing the config file for the tcc.jar util: " + VsCodeUtils.formatErrorMessage(err));
            VsCodeUtils.showErrorMessage("Unexpected error during removing the config file for the tcc.jar util");
            return false;
        }
        Logger.logDebug("TccPatchSender#remoteRun: step 4 was passed");
        return true;
    }

    /**
     * @return - line in the format ${"buildconfig1,buildConfig2,...,buildconfigN"}
     */
    private configArray2String(configsArr : BuildConfigItem[]) : string {
        if (!configsArr) {
            return `""`;
        }
        const configSB : string[] = [];
        for (let i = 0; i < configsArr.length; i++) {
            configSB.push(configsArr[i].id);
        }
        const configStr : string  = `"${configSB.join(",")}"`;
        Logger.logDebug(`TccPatchSender#configArray2String: configStr is ${configStr}`);
        return configStr;
    }

    /**
     * @return - line in the format ${"absFilePath1 absFilePath2 ... absFilePathN"}
     */
    private filePaths2String(changedFiles : string[]) : string {
        const changedFilesSB = [];
        for (let i = 0; i < changedFiles.length; i++) {
            changedFilesSB.push(`"${changedFiles[i]}"`);
        }
        const changedFilesPaths : string = changedFilesSB.join(" ");
        Logger.logDebug(`TccPatchSender#filePaths2String: changedFilesPaths is ${changedFilesPaths}`);
        return changedFilesPaths;
    }

    /**
     * The object that provids api for private fields and methods of class.
     * Use for test purposes only!
     */
    public getTestObject() : any {
        const testObject : any = {};
        testObject.configArray2String = this.configArray2String;
        testObject.filePaths2String = this.filePaths2String;
        return testObject;
    }
}
