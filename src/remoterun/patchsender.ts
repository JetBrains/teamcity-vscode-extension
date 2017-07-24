"use strict";

import * as path from "path";
import * as cp from "child-process-promise";
import { Credential } from "../credentialstore/credential";
import { FileController } from "../utils/filecontroller";
import { VsCodeUtils } from "../utils/vscodeutils";
import { extensions } from "vscode";
import { BuildConfigItem } from "./configexplorer";
import { CvsSupportProvider } from "./cvsprovider";
import { CvsSupportProviderFactory } from "./cvsproviderfactory";
import { workspace, SourceControlResourceState } from "vscode";

export interface PatchSender {
    /* async */ remoteRun(cred : Credential, configs : BuildConfigItem[], changedFiles : string[], commitMessage? : string);
}

/**
 * Implementation of PatchSender that is required tcc.jar util.
 */
export class TccPatchSender implements PatchSender {

    public async remoteRun(cred : Credential, configs : BuildConfigItem[], changedFiles : string[], commitMessage? : string) {
        const tccPath : string = `${path.join(__dirname, "..", "..", "..", "resources", "tcc.jar")}`;
        if (!FileController.exists(tccPath)) {
            VsCodeUtils.displayNoTccUtilMessage();
            return;
        }

        /* Step 1. Sending login request by the tcc.jar util. */
        try {
            const tccLoginCommand : string = `java -jar "${tccPath}" login --host ${cred.serverURL} --user ${cred.user} --password ${cred.pass}`;
            await cp.exec(tccLoginCommand);
        }catch (err) {
            VsCodeUtils.showErrorMessage("Unexpected error during sending login request by the tcc.jar util: " + err);
            return;
        }

        /* Step 2. Creating a config file for the tcc.jar util. */
        const configFileName : string = path.join(workspace.rootPath, ".teamcity-mappings.properties");
        let cvsProvider : CvsSupportProvider;
        try {
            cvsProvider = await CvsSupportProviderFactory.getCvsSupportProvider();
            const configFileContent : string = await cvsProvider.generateConfigFileContent();
            await FileController.createFileAsync(configFileName, configFileContent);
        }catch (err) {
            VsCodeUtils.showErrorMessage("Unexpected error during creating a config file for the tcc.jar util: " + err);
            return;
        }
        /* Step 3. Preparing arguments and executing the tcc.jat util. */
        try {
            const configListAsString : string = this.configArray2String(configs);
            const filePathsAsString : string = this.filePaths2String(changedFiles);
            const runBuildCommand : string = `java -jar "${tccPath}" run --host ${cred.serverURL} -m "${commitMessage}" -c ${configListAsString} ${filePathsAsString}`;
            const prom = await cp.exec(runBuildCommand);
            if (prom.errout) {
                console.log(prom.errout);
            }
            console.log(prom.stdout);
        }catch (err) {
            VsCodeUtils.showErrorMessage("Unexpected error during preparing arguments and executing the tcc.jar util: " + err);
            return;
        }
        /* Step 4. Removing the config file for the tcc.jar util.*/
        try {
            await FileController.removeFileAsync(configFileName);
        }catch (err) {
            VsCodeUtils.showErrorMessage("Unexpected error during removing the config file for the tcc.jar util: " + err);
            return;
        }
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
        return `"${configSB.join(",")}"`;
    }

    /**
     * @return - line in the format ${"absFilePath1 absFilePath2 ... absFilePathN"}
     */
    private filePaths2String(changedFiles : string[]) : string {
        const changedFilesSB = [];
        for (let i = 0; i < changedFiles.length; i++) {
            changedFilesSB.push(`"${changedFiles[i]}"`);
        }
        return changedFilesSB.join(" ");
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
