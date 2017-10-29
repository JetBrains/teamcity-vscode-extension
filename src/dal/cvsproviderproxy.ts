"use strict";

import {CvsSupportProvider} from "./cvsprovider";
import {CvsOperation, CvsProviderTypes} from "../bll/utils/constants";
import {CheckInInfo} from "../bll/entities/checkininfo";
import {QuickPickItem, QuickPickOptions, Uri, window, workspace} from "vscode";
import {GitSupportProvider} from "./gitprovider";
import {TfvcSupportProvider} from "./tfsprovider";
import {injectable} from "inversify";
import {Logger} from "../bll/utils/logger";
import {MessageConstants} from "../bll/utils/messageconstants";
import {VsCodeUtils} from "../bll/utils/vscodeutils";

@injectable()
export class CvsProviderProxy {
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
        const nextOperation: string = await this.getNextOperation(checkInArray);
        switch (nextOperation) {
            case CvsOperation.DoCommitChanges: {
                await this.doCommitOperation(checkInArray);
                break;
            }
            case CvsOperation.DoCommitAndPushChanges: {
                await this.doCommitAndPushOperation(checkInArray);
                break;
            }
        }
    }

    private async getNextOperation(checkInArray: CheckInInfo[]): Promise<string> {
        const choices: QuickPickItem[] = [];
        choices.push({label: CvsOperation.DoNothing, description: undefined});
        choices.push({label: CvsOperation.DoCommitChanges, description: undefined});
        const shouldAddPushOption: boolean = this.isGitPresented(checkInArray);
        if (shouldAddPushOption) {
            choices.push({label: CvsOperation.DoCommitAndPushChanges, description: undefined});
        }
        const options: QuickPickOptions = {
            ignoreFocusOut: true,
            matchOnDescription: false,
            placeHolder: MessageConstants.REQUEST_FOR_NEXT_OPERATION
        };
        const nextOperation: QuickPickItem = await window.showQuickPick(choices, options);
        return nextOperation ? nextOperation.label : CvsOperation.DoNothing;
    }

    private isGitPresented(checkInArray: CheckInInfo[]): boolean {
        for (let i = 0; i < checkInArray.length; i++) {
            const checkInInfo: CheckInInfo = checkInArray[i];
            const provider: CvsSupportProvider = checkInInfo.cvsProvider;
            if (provider instanceof GitSupportProvider) {
                return true;
            }
        }
        return false;
    }

    private async doCommitOperation(checkInArray: CheckInInfo[]): Promise<void> {
        const commitMessage: string = await this.getUpdatedCommitMessages(checkInArray);
        this.setUpdatedCommitMessages(checkInArray, commitMessage);
        for (let i = 0; i < checkInArray.length; i++) {
            const checkInInfo: CheckInInfo = checkInArray[i];
            const provider: CvsSupportProvider = checkInInfo.cvsProvider;
            await provider.commit(checkInInfo);
        }
    }

    private async doCommitAndPushOperation(checkInArray: CheckInInfo[]): Promise<void> {
        const commitMessage: string = await this.getUpdatedCommitMessages(checkInArray);
        this.setUpdatedCommitMessages(checkInArray, commitMessage);
        for (let i = 0; i < checkInArray.length; i++) {
            for (let i = 0; i < checkInArray.length; i++) {
                const checkInInfo: CheckInInfo = checkInArray[i];
                const provider: CvsSupportProvider = checkInInfo.cvsProvider;
                await provider.commitAndPush(checkInInfo);
            }
        }
    }

    private async getUpdatedCommitMessages(checkInArray: CheckInInfo[]): Promise<string> {
        let commitMessage: string;
        if (checkInArray.length > 0) {
            const previousMessage: string = checkInArray[0].message;
            commitMessage = await window.showInputBox({
                prompt: MessageConstants.PROVIDE_MESSAGE_FOR_COMMIT,
                value: previousMessage
            });
        }
        return commitMessage || "";
    }

    private setUpdatedCommitMessages(checkInArray: CheckInInfo[], commitMessage: string) {
        checkInArray.forEach((checkInInfo) => {
            checkInInfo.message = commitMessage;
        });
    }
}
