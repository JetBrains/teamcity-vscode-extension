"use struct";

import { window } from "vscode";
import { Strings } from "../utils/strings";
import { BuildConfig } from "../remoterun/configexplorer";

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

    public static indexOfBuildConfig(searched : BuildConfig, array : BuildConfig[]) : number{
        for (let i : number = 0; i < array.length; i++){
            const elem : BuildConfig = array[i];
            if (elem.id === searched.id){
                return i;
            }
        }
        return -1;
    }
}