"use strict";

import {Logger} from "../utils/logger";
import {GitUtils} from "../cvsutils/gitutils";
import {TfsUtils} from "../cvsutils/tfsutils";
import {VsCodeUtils} from "../utils/vscodeutils";
import {CvsSupportProvider} from "../../dal/cvsprovider";
import {GitSupportProvider} from "../../dal/gitprovider";
import {TfsSupportProvider} from "../../dal/tfsprovider";
import {MessageManager} from "../../view/messagemanager";

export class CvsSupportProviderFactory {

    /**
     * This method detects an active cvs provider and
     * @return an appropriate CvsSupportProvider implementation.
     * When particularProvider != undefined, this method returns requested CvsProvide, but without initialization;
     */
    public static async getCvsSupportProviders(): Promise<CvsSupportProvider[]> {
        const cvsProviders: CvsSupportProvider[] = [];
        let gitPath: string = undefined;
        let gitIsActive: boolean = false;
        let gitErrorMessage: string = undefined;
        try {
            gitPath = await GitUtils.getPath();
            await GitUtils.checkIsActive(gitPath);
            gitIsActive = true;
        } catch (err) {
            gitErrorMessage = VsCodeUtils.formatErrorMessage(err);
        }
        if (gitIsActive) {
            Logger.logDebug(`CvsSupportProviderFactory#getCvsSupportProvider: git is an activeCvs`);
            await CvsSupportProviderFactory.putGitProviderIntoCvsCollection(cvsProviders, gitPath);
        }

        let tfvcPath: string = undefined;
        let tfvcIsActive: boolean = false;
        let tfvcErrorMessage: string = undefined;
        try {
            tfvcPath = await TfsUtils.getPath();
            await TfsUtils.checkIsActive(tfvcPath);
            tfvcIsActive = true;
        } catch (err) {
            tfvcErrorMessage = VsCodeUtils.formatErrorMessage(err);
        }

        if (tfvcIsActive) {
            Logger.logDebug(`CvsSupportProviderFactory#getCvsSupportProvider: tfs is an activeCvs`);
            await CvsSupportProviderFactory.putTfvcProviderIntoCvsCollection(cvsProviders, tfvcPath);
        }

        if (cvsProviders.length === 0) {
            Logger.logWarning(`CvsSupportProviderFactory#getCvsSupportProvider: cvs was not found!`);
            MessageManager.showWarningMessage(gitErrorMessage);
            MessageManager.showWarningMessage(tfvcErrorMessage);
        }
        return cvsProviders;
    }

    private static async putGitProviderIntoCvsCollection(cvsProviders: CvsSupportProvider[], gitPath: string): Promise<CvsSupportProvider[]> {
        try {
            const gitProvider: GitSupportProvider = await GitSupportProvider.init(gitPath);
            cvsProviders.push(gitProvider);
        } catch (err) {
            MessageManager.showErrorMessage(VsCodeUtils.formatErrorMessage(err));
        }
        return cvsProviders;
    }

    private static async putTfvcProviderIntoCvsCollection(cvsProviders: CvsSupportProvider[], tfvcPath: string): Promise<CvsSupportProvider[]> {
        try {
            const tfvsProvider: TfsSupportProvider = await TfsSupportProvider.init(tfvcPath);
            cvsProviders.push(tfvsProvider);
        } catch (err) {
            MessageManager.showErrorMessage(VsCodeUtils.formatErrorMessage(err));
        }
        return cvsProviders;
    }
}
