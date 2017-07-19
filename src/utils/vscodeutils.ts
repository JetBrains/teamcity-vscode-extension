"use strict";

import { window, extensions } from "vscode";
import { Strings } from "../utils/strings";
import { CvsProvider, Constants } from "../utils/constants";


export class VsCodeUtils{

    public static async showErrorMessage(messageToDisplay: string) : Promise<void> {
        await window.showErrorMessage(messageToDisplay);
    }

    public static async showInfoMessage(messageToDisplay: string,): Promise<void> {
        await window.showInformationMessage(messageToDisplay);
    }

    public static async showWarningMessage(messageToDisplay: string): Promise<void> {
        await this.showErrorMessage(messageToDisplay);
    }

    public static async displayNoCredentialsMessage(): Promise<void> {
        let displayError: string = Strings.NO_CREDENTIALS_RUN_SIGNIN;
        VsCodeUtils.showErrorMessage(displayError);
    }

    public static async displayNoSelectedConfigsMessage(): Promise<void> {
        let displayError: string = Strings.NO_CONFIGS_RUN_REMOTERUN;
        VsCodeUtils.showErrorMessage(displayError);
    }

    public static async displayNoTccUtilMessage(): Promise<void> {
        let displayError: string = Strings.NO_TCC_UTIL;
        VsCodeUtils.showErrorMessage(displayError);
    }

    /**
     * Currently there is no a public vscode api to detect an active scm provider.
     * TeamCity Extension tries to get staged resources from external extensions to detect an scm provider.
     * @result - Promise for value of enum CvsProvider: {Git, Tfs, UndefinedCvs} 
     */
    public static async getActiveScm() : Promise<CvsProvider> {
        let gitExt = extensions.getExtension(Constants.GIT_EXTENSION_ID);
        try{
            if (gitExt.exports.getResources().length > 0){
                return CvsProvider.Git;
            }
        }catch(err){
            //An exception means that Git extension isn't active at the moment
        }

        let tfsExt = extensions.getExtension(Constants.TFS_EXTENSION_ID);
        try{
            if (tfsExt.exports.getCheckinServerUris().length > 0){
                    return CvsProvider.Tfs;
            }
        }catch(err){
            //An exception means that Tfs extension isn't active at the moment
        }
        return CvsProvider.UndefinedCvs;  
    }  

}