"use strict";

import { CvsSupportProvider, GitSupportProvider, TfsSupportProvider } from "./cvsprovider";
import { VsCodeUtils } from "../utils/vscodeutils";
import { CvsProviderTypes } from "../utils/constants";

export class CvsSupportProviderFactory {

    /**
     * This method detects an active cvs provider and
     * @return an appropriate CvsSupportProvider implementation
     */
    public static async getCvsSupportProvider() : Promise<CvsSupportProvider> {
        const activeCvs : CvsProviderTypes = await VsCodeUtils.getActiveScm();
        if (activeCvs === CvsProviderTypes.Git) {
            return new GitSupportProvider();
        }else if (activeCvs === CvsProviderTypes.Tfs) {
            return new TfsSupportProvider();
        }else {
            //TODO: think of behaviour in this case
        }
    }
}
