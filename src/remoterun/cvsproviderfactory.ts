"use strict";

import { Logger } from "../utils/logger";
import { GitUtils } from "../utils/gitutils";
import { TfsUtils } from "../utils/tfsutils";
import { CvsInfo } from "../utils/interfaces";
import { VsCodeUtils } from "../utils/vscodeutils";
import { CvsSupportProvider } from "./cvsprovider";
import { GitSupportProvider } from "./gitprovider";
import { TfsSupportProvider } from "./tfsprovider";
import { CvsProviderTypes } from "../utils/constants";

export class CvsSupportProviderFactory {

    /**
     * This method detects an active cvs provider and
     * @return an appropriate CvsSupportProvider implementation.
     * When particularProvider != undefined, this method returns requested CvsProvide, but without initialization;
     */
    public static async getCvsSupportProvider() : Promise<CvsSupportProvider> {
        const gitCvsInfo : CvsInfo = await GitUtils.collectInfo();
        const gitIsActive : boolean = gitCvsInfo.isChanged;
        if (gitIsActive) {
            Logger.logDebug(`CvsSupportProviderFactory#getCvsSupportProvider: git is an activeCvs`);
            const getProvider = new GitSupportProvider(gitCvsInfo.path);
            await getProvider.init();
            return getProvider;
        }

        const tfsCvsInfo : CvsInfo = await TfsUtils.collectInfo();
        const tfsIsActive : boolean = tfsCvsInfo.isChanged;
        if (tfsIsActive) {
            Logger.logDebug(`CvsSupportProviderFactory#getCvsSupportProvider: tfs is an activeCvs`);
            const tfsProvider = new TfsSupportProvider(tfsCvsInfo.path);
            await tfsProvider.init();
            return tfsProvider;
        }

        Logger.logWarning(`CvsSupportProviderFactory#getCvsSupportProvider: cvs was not found!`);
        VsCodeUtils.showWarningMessage(this.detectProblems(gitCvsInfo, tfsCvsInfo));
    }

    /**
     * This method is trying to find the problem from hightest prioritet.
     * Problem hierarchy:
     * 1. There is no cvs intalled
     * 2. Incompatible cvs version
     * 3. RootPath isn't a cvs repo path
     * 4. There are no staged changes
     */
    private static detectProblems( ...cvsInfoArray : CvsInfo[]) : string {
        let errMsg : string = undefined;
        const problemCvs : CvsProviderTypes[] = [];
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

        const proplemCvsMsg : string[] = [];
        cvsInfoArray.forEach((cvsInfo) => {
            if (cvsInfo.versionErrorMsg !== undefined) {
                problemCvs.push(cvsInfo.cvsType);
                proplemCvsMsg.push(cvsInfo.versionErrorMsg);
            }
        });

        if (problemCvs.length !== 0) {
            if (problemCvs.length === 1) {
                errMsg = `There is a problem with ${problemCvs.join("")} version`;
            } else {
                errMsg = `There are problems with ${problemCvs.join("/")} versions`;
            }
            Logger.logWarning(`CvsSupportProviderFactory#detectProblems: ${errMsg}: ${proplemCvsMsg.join("; ")}`);
            return errMsg;
        }

        Logger.logWarning(`No version control detected`);
        return `No version control detected`;
    }
}
