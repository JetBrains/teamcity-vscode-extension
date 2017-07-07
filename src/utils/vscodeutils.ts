"use struct";

import { window } from "vscode";

export class VsCodeUtils{

    public static async ShowErrorMessage(messageToDisplay: string) : Promise<void> {
        await window.showErrorMessage(messageToDisplay);
    }

    public static async ShowInfoMessage(messageToDisplay: string,): Promise<void> {
        await window.showInformationMessage(messageToDisplay);
    }

    public static async ShowWarningMessage(messageToDisplay: string): Promise<void> {
        await this.ShowErrorMessage(messageToDisplay);
    }
}