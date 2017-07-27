"use strict";

import { window, extensions, Extension } from "vscode";
import { Strings } from "../utils/strings";
import { CvsProviderTypes, Constants } from "../utils/constants";
import { CvsSupportProviderFactory } from "../remoterun/cvsproviderfactory";
import { CvsSupportProvider } from "../remoterun/cvsprovider";
const pako = require("pako");

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
        const gitProvider : CvsSupportProvider = await CvsSupportProviderFactory.getCvsSupportProvider(CvsProviderTypes.Git);
        if (await gitProvider.isActive()) {
            return CvsProviderTypes.Git;
        }
        const tfsProvider : CvsSupportProvider = await CvsSupportProviderFactory.getCvsSupportProvider(CvsProviderTypes.Tfs);
        if (await tfsProvider.isActive()) {
            return CvsProviderTypes.Tfs;
        }

        return CvsProviderTypes.UndefinedCvs;
    }

    /**
     * @param arg - any string in the format ${value1:value2}
     * @return - an array in the format ${[value1, value2]}
     */
    public static parseValueColonValue(arg : string) : string[] {
        const KEY_SEPARATOR : string = ":";
        if (arg === undefined || !arg.indexOf(KEY_SEPARATOR)) {
            return undefined;
        }
        const keys = arg.split(KEY_SEPARATOR);
        return keys.length !== 2 ? undefined : keys;
    }

    public static gzip2Str(gzip : Uint8Array[]) : string {
        const buffer : string[] = [];
        // Pako magic
        const inflatedGzip : Uint16Array = pako.inflate(gzip);
        // Convert gunzipped byteArray back to ascii string:
        for (let i : number = 0; i < inflatedGzip.byteLength; i = i + 200000) {
            /*RangeError: Maximum call stack size exceeded when i is between 250000 and 260000*/
            const topIndex = Math.min(i + 200000, inflatedGzip.byteLength);
            /* tslint:disable:no-null-keyword */
            buffer.push(String.fromCharCode.apply(null, new Uint16Array(inflatedGzip.slice(i, topIndex))));
            /* tslint:enable:no-null-keyword */
        }
        return buffer.join("");
    }
}
