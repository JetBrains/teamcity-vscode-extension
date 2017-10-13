"use strict";

import {CvsSupportProvider} from "./cvsprovider";
import {CvsProviderTypes} from "../bll/utils/constants";
import {CheckInInfo} from "../bll/entities/checkininfo";
import {ReadableSet} from "../bll/utils/readableset";
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
    private actialProviders: CvsSupportProvider[] = [];

    constructor() {
        const rootPaths: Uri[] = this.collectAllRootPaths();
        this.detectCvsProviders(rootPaths).then((detectedCvsProviders) => {
            this.actialProviders = detectedCvsProviders;
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
            const tfvcProvider: TfvcSupportProvider = new TfvcSupportProvider();
            if (tfvcProvider.isActive) {
                detectedCvsProviders.push(tfvcProvider);
            }
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
            const provider: CvsSupportProvider = this.actialProviders[i];
            const formattedFileNamesFromOneProvider = await provider.getFormattedFileNames(checkInInfo);
            formattedFileNamesFromOneProvider.forEach((fileName) => formattedFileNames.push(fileName));
        }
        return formattedFileNames;
    }

    public async getRequiredCheckInInfo(): Promise<CheckInInfo[]> {
        const result: CheckInInfo[] = [];
        for (let i = 0; i < this.actialProviders.length; i++) {
            const provider: CvsSupportProvider = this.actialProviders[i];
            try {
                const checkInInfo: CheckInInfo = await provider.getRequiredCheckInInfo();
                result.push(checkInInfo);
            } catch (err) {
                Logger.logError(VsCodeUtils.formatErrorMessage(err));
            }
        }
        return result;
    }

    requestForPostCommit(checkInInfo: CheckInInfo) {
        return undefined;
    }

    getStagedFileContentStream(fileAbsPath: string): Promise<ReadableSet> | any {
        return undefined;
    }

}
