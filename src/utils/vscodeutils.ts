"use strict";

import { window, extensions, Extension } from "vscode";
import { Strings } from "../utils/strings";
import { CvsProviderTypes, Constants } from "../utils/constants";

export class VsCodeUtils {

    public static async showErrorMessage(messageToDisplay: string) : Promise<void> {
        await window.showErrorMessage(messageToDisplay);
    }

    public static async showInfoMessage(messageToDisplay: string): Promise<void> {
        await window.showInformationMessage(messageToDisplay);
    }

    public static async showWarningMessage(messageToDisplay: string): Promise<void> {
        await this.showErrorMessage(messageToDisplay);
    }

    public static async displayNoCredentialsMessage(): Promise<void> {
        const displayError: string = Strings.NO_CREDENTIALS_RUN_SIGNIN;
        VsCodeUtils.showErrorMessage(displayError);
    }

    public static async displayNoSelectedConfigsMessage(): Promise<void> {
        const displayError: string = Strings.NO_CONFIGS_RUN_REMOTERUN;
        VsCodeUtils.showErrorMessage(displayError);
    }

    public static async displayNoTccUtilMessage(): Promise<void> {
        const displayError: string = Strings.NO_TCC_UTIL;
        VsCodeUtils.showErrorMessage(displayError);
    }

    /**
     * Currently there is no a public vscode api to detect an active scm provider.
     * TeamCity Extension tries to get staged resources from external extensions to detect an scm provider.
     * @return - Promise for value of enum CvsProvider: {Git, Tfs, UndefinedCvs}
     */
    public static async getActiveScm() : Promise<CvsProviderTypes> {
        const gitExt : Extension<any> = extensions.getExtension(Constants.GIT_EXTENSION_ID);
        try {
            if (gitExt.isActive && gitExt.exports.getResources().length > 0) {
                return CvsProviderTypes.Git;
            }
        }catch (err) {
            console.log(err);
            //An exception means that Git extension isn't active at the moment
        }

        const tfsExt = extensions.getExtension(Constants.TFS_EXTENSION_ID);
        try {
            const isActive = tfsExt.isActive;
            if (tfsExt.isActive && tfsExt.exports.getCheckinServerUris().length > 0) {
                    return CvsProviderTypes.Tfs;
            }
        }catch (err) {
            console.log(err);
            //An exception means that Tfs extension isn't active at the moment
        }
        return CvsProviderTypes.UndefinedCvs;
    }
}
