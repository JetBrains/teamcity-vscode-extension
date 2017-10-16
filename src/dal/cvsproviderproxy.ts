"use strict";

import {CvsSupportProvider} from "./cvsprovider";
import {CvsProviderTypes} from "../bll/utils/constants";
import {CheckInInfo} from "../bll/entities/checkininfo";
import {Uri, workspace} from "vscode";
import {GitSupportProvider} from "./gitprovider";
import {TfvcSupportProvider} from "./tfsprovider";
import {injectable} from "inversify";
import {Logger} from "../bll/utils/logger";
import {VsCodeUtils} from "../bll/utils/vscodeutils";

@injectable()
export class CvsProviderProxy {
    cvsType: CvsProviderTypes;
    isActive: boolean;
    private actualProviders: CvsSupportProvider[] = [];

    constructor() {
        const rootPaths: Uri[] = this.collectAllRootPaths();
        this.detectCvsProviders(rootPaths).then((detectedCvsProviders) => {
            this.actualProviders = detectedCvsProviders;
        });
    }

    private collectAllRootPaths(): Uri[] {
        const rootPaths: Uri[] = [];
        const workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length !== 0) {
            workspaceFolders.forEach((workspaceFolder) => {
                rootPaths.push(workspaceFolder.uri);
            });
        }
        return rootPaths;
    }

    private async detectCvsProviders(rootPaths: Uri[]): Promise<CvsSupportProvider[]> {
        const detectedCvsProviders: CvsSupportProvider[] = [];
        for (let i = 0; i < rootPaths.length; i++) {
            const providers: CvsSupportProvider[] = await this.detectCvsProviderInParticularDirectory(rootPaths[i]);
            providers.forEach((provider) => detectedCvsProviders.push(provider));
        }
        return detectedCvsProviders;
    }

    private async detectCvsProviderInParticularDirectory(rootPath: Uri): Promise<CvsSupportProvider[]> {
        const detectedCvsProviders: CvsSupportProvider[] = [];
        try {
            const gitProvider: CvsSupportProvider = await GitSupportProvider.tryActivateInPath(rootPath);
            detectedCvsProviders.push(gitProvider);
        } catch (err) {
            Logger.logError(VsCodeUtils.formatErrorMessage(err));
        }
        try {
            const tfvcProvider: CvsSupportProvider = await TfvcSupportProvider.tryActivateInPath(rootPath);
            detectedCvsProviders.push(tfvcProvider);
        } catch (err) {
            Logger.logError(VsCodeUtils.formatErrorMessage(err));
        }
        return detectedCvsProviders;
    }

    public async getFormattedFileNames(checkInArray: CheckInInfo[]): Promise<string[]> {
        const formattedFileNames: string[] = [];
        if (!checkInArray) {
            return [];
        }
        for (let i = 0; i < checkInArray.length; i++) {
            const checkInInfo: CheckInInfo = checkInArray[i];
            const provider: CvsSupportProvider = this.actualProviders[i];
            const formattedFileNamesFromOneProvider = await provider.getFormattedFileNames(checkInInfo);
            formattedFileNamesFromOneProvider.forEach((fileName) => formattedFileNames.push(fileName));
        }
        return formattedFileNames;
    }

    public async getRequiredCheckInInfo(): Promise<CheckInInfo[]> {
        const result: CheckInInfo[] = [];
        for (let i = 0; i < this.actualProviders.length; i++) {
            const provider: CvsSupportProvider = this.actualProviders[i];
            try {
                const checkInInfo: CheckInInfo = await provider.getRequiredCheckInInfo();
                result.push(checkInInfo);
            } catch (err) {
                Logger.logError(VsCodeUtils.formatErrorMessage(err));
            }
        }
        return result;
    }

    public async requestForPostCommit(checkInArray: CheckInInfo[]): Promise<void> {
        for (let i = 0; i < checkInArray.length; i++) {
            const checkInInfo: CheckInInfo = checkInArray[i];
            await this.postCommitOfCheckInInfo(checkInInfo);
        }
    }

    private async postCommitOfCheckInInfo(checkInInfo: CheckInInfo): Promise<void> {
        if (this.isNotEpmty(checkInInfo)) {
            const provider: CvsSupportProvider = checkInInfo.cvsProvider;
            await provider.requestForPostCommit(checkInInfo);
        }
    }

    private isNotEpmty(checkInInfo: CheckInInfo): boolean {
        return checkInInfo && checkInInfo.cvsLocalResources && checkInInfo.cvsLocalResources.length > 0;
    }
}
