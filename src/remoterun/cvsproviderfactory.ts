"use strict";

import { CvsSupportProvider, GitSupportProvider, TfsSupportProvider } from "./cvsprovider";
import { VsCodeUtils } from "../utils/vscodeutils";
import { CvsProvider } from "../utils/constants";

export class CvsSupportProviderFactory {

    /**
     * This method detects an active cvs provider and
     * @return an appropriate CvsSupportProvider implementation
     */
    public static async getCvsSupportProvider() : Promise<CvsSupportProvider> {
        const activeCvs : CvsProvider = await VsCodeUtils.getActiveScm();
        if (activeCvs === CvsProvider.Git) {
            return new GitSupportProvider();
        }else if (activeCvs === CvsProvider.Tfs) {
            return new TfsSupportProvider();
        }else {
            //TODO: think of behaviour in this case
        }
    }
}
