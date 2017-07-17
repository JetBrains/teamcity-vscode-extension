"use struct";

import * as path from "path";
import * as cp from "child_process";
import { Credential } from "../credentialstore/credential";
import { CredentialStore } from "../credentialstore/credentialstore";
import { FileController } from "../utils/filecontroller";
import { VsCodeUtils } from "../utils/vscodeutils";
import { BuildConfig } from "./configexplorer";
import { CvsSupportProvider, GitSupportProvider } from "./cvssupportprovider";
import { workspace, SourceControlResourceState } from "vscode";

export interface PatchSender{
    /* async */ remoteRun(cred : Credential, configs : BuildConfig[], changedFiles : SourceControlResourceState[], commitMessage? : string);
}

/**
 * Implementation of PatchSender that is required tcc.jar util.  
 */
export class TccPatchSender implements PatchSender{

    public async remoteRun(cred : Credential, configs : BuildConfig[], changedFiles : SourceControlResourceState[], commitMessage? : string){
        let tccPath : string = `${path.join(__dirname, "..", "..", "..", "resources", "tcc.jar")}`;
        if (!FileController.exists(tccPath)){
            VsCodeUtils.displayNoTccUtilMessage();
            return;
        }
        
        /* Step 1. Sending login request by the tcc.jar util. */
        try{
            let tccLoginCommand : string = `java -jar "${tccPath}" login --host ${cred.serverURL} --user ${cred.user} --password ${cred.pass}`;
            await new Promise((resolve, reject) => {
                cp.exec(tccLoginCommand, (err, res) => { 
                    if (err){
                        reject(err);
                    }
                    resolve();
                });
            });
        }catch(err){
            VsCodeUtils.showErrorMessage("Unexpected error during sending login request by the tcc.jar util: " + err);
        }

        /* Step 2. Creating a config file for the tcc.jar util. */
        const configFileName : string = path.join(workspace.rootPath, ".teamcity-mappings.properties");
        try{
            const cvsProvider : CvsSupportProvider = new GitSupportProvider();
            const configFileContent : string = await cvsProvider.generateConfigFileContent();
            await FileController.createFileAsync(configFileName, configFileContent);
        }catch(err){
            VsCodeUtils.showErrorMessage("Unexpected error during creating a config file for the tcc.jar util: " + err);
        }
        /* Step 3. Preparing arguments and executing the tcc.jat util. */ 
        try{
            const configListAsString : string = this.configArray2String(configs);       
            const filePathsAsString : string= this.fileArray2String(changedFiles);
            const runBuildCommand : string = `java -jar "${tccPath}" run --host ${cred.serverURL} -m "${commitMessage}" -c ${configListAsString} ${filePathsAsString}`;
            await new Promise((resolve, reject) => { 
                cp.exec(runBuildCommand, (err, res) => { 
                    if (err){
                        console.log(err);
                        reject(err);
                    }
                    console.log(res);
                    resolve();
                })
            });
        }catch(err){
            VsCodeUtils.showErrorMessage("Unexpected error during preparing arguments and executing the tcc.jat util: " + err);
        }
        /* Step 4. Removing the config file for the tcc.jar util.*/ 
        try{
            await FileController.removeFileAsync(configFileName);
        }catch(err){
            VsCodeUtils.showErrorMessage("Unexpected error during removing the config file for the tcc.jar util: " + err);
        }
    }

    /**
     * @result - line in the format ${"buildconfig1,buildConfig2,...,buildconfigN"}
     */ 
    private configArray2String(configsArr : BuildConfig[]) : string {
        if (!configsArr){
            return '""';
        }
        let configSB : string[] = [];
        for (let i = 0; i < configsArr.length; i++){
            configSB.push(configsArr[i].id);
        }
        return `"${configSB.join(",")}"`;
    }

    /**
     * @result - line in the format ${"absFilePath1 absFilePath2 ... absFilePathN"}
     */
    private fileArray2String(changedFiles : SourceControlResourceState[]) : string {
        let changedFilesSB = [];
        for (let i = 0; i < changedFiles.length; i++){
            changedFilesSB.push(`"${changedFiles[i].resourceUri.fsPath}"`);
        }
        return changedFilesSB.join(" ");
    }

    /**
     * The object that provids api for private fields and methods of class.
     * Use for test purposes only! 
     */
    public getTestObject() : any {
        let testObject : any = {};
        testObject.configArray2String = this.configArray2String;
        testObject.fileArray2String = this.fileArray2String;
        return testObject;
    }
}
