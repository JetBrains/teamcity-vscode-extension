"use strict";

import {Logger} from "../utils/logger";
import {GitUtils} from "../cvsutils/gitutils";
import {TfsUtils} from "../cvsutils/tfsutils";
import {CvsSupportProvider} from "../../dal/cvsprovider";
import {GitSupportProvider} from "../../dal/gitprovider";
import {TfsSupportProvider} from "../../dal/tfsprovider";
import {CvsProviderTypes} from "../utils/constants";
import {CvsInfo} from "../cvsutils/cvsinfo";
import { MessageManager } from "../../view/messagemanager";

export class CvsSupportProviderFactory {

    /**
     * This method detects an active cvs provider and
     * @return an appropriate CvsSupportProvider implementation.
     * When particularProvider != undefined, this method returns requested CvsProvide, but without initialization;
     */
    public static async getCvsSupportProviders(): Promise<CvsSupportProvider[]> {
        const gitCvsInfo: CvsInfo = await GitUtils.collectInfo();
        const cvsProviders : CvsSupportProvider[] = [];
        const gitIsActive: boolean = gitCvsInfo.isChanged;
        if (gitIsActive) {
            Logger.logDebug(`CvsSupportProviderFactory#getCvsSupportProvider: git is an activeCvs`);
            const gitProvider = new GitSupportProvider(gitCvsInfo.path);
            try {
                await gitProvider.init();
            } catch (err) {
                throw new Error("(teamcity) An error occurred during gitProvider initialisation");
            }
            cvsProviders.push(gitProvider);
        }

        const tfsCvsInfo: CvsInfo = await TfsUtils.collectInfo();
        const tfsIsActive: boolean = tfsCvsInfo.isChanged;
        if (tfsIsActive) {
            Logger.logDebug(`CvsSupportProviderFactory#getCvsSupportProvider: tfs is an activeCvs`);
            const tfsProvider = new TfsSupportProvider(tfsCvsInfo.path);
            await tfsProvider.init();
            cvsProviders.push(tfsProvider);
        }
        if (cvsProviders.length === 0) {
            Logger.logWarning(`CvsSupportProviderFactory#getCvsSupportProvider: cvs was not found!`);
            MessageManager.showWarningMessage(this.detectProblems(gitCvsInfo, tfsCvsInfo));
        }
        return cvsProviders;
    }

    /**
     * This method is trying to find the problem from highest priority.
     * Problem hierarchy:
     * 1. There is no cvs installed
     * 2. Incompatible cvs version
     * 3. RootPath isn't a cvs repo path
     * 4. There are no staged changes
     */
    private static detectProblems(...cvsInfoArray: CvsInfo[]): string {
        let errMsg: string = undefined;
        const problemCvs: CvsProviderTypes[] = [];
        if (!cvsInfoArray && cvsInfoArray.length === 0) {
            Logger.logDebug(`CvsSupportProviderFactory#detectProblems: cvsInfoArray is empty`);
            return;
        }

        cvsInfoArray.forEach((cvsInfo) => {
            if (cvsInfo.isChanged === false) {
                problemCvs.push(cvsInfo.cvsType);
            }
        });

        if (problemCvs.length !== 0) {
            errMsg = `No staged changes detected in ${problemCvs.join("/")} repository`;
            Logger.logWarning("CvsSupportProviderFactory#detectProblems: " + errMsg + ". Please, stage your files and try again.");
            return errMsg;
        }

        cvsInfoArray.forEach((cvsInfo) => {
            if (cvsInfo.isChanged === undefined &&
                cvsInfo.versionErrorMsg === undefined &&
                cvsInfo.path) {
                problemCvs.push(cvsInfo.cvsType);
            }
        });

        if (problemCvs.length !== 0) {
            errMsg = `No ${problemCvs.join("/")} repository detected`;
            Logger.logWarning("CvsSupportProviderFactory#detectProblems: " + errMsg);
            return errMsg;
        }

        const problemCvsMsg: string[] = [];
        cvsInfoArray.forEach((cvsInfo) => {
            if (cvsInfo.versionErrorMsg !== undefined) {
                problemCvs.push(cvsInfo.cvsType);
                problemCvsMsg.push(cvsInfo.versionErrorMsg);
            }
        });

        if (problemCvs.length !== 0) {
            if (problemCvs.length === 1) {
                errMsg = `There is a problem with ${problemCvs.join("")} version`;
            } else {
                errMsg = `There are problems with ${problemCvs.join("/")} versions`;
            }
            Logger.logWarning(`CvsSupportProviderFactory#detectProblems: ${errMsg}: ${problemCvsMsg.join("; ")}`);
            return errMsg;
        }

        Logger.logWarning(`No version control detected`);
        return `No version control detected`;
    }
}
