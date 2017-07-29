"use strict";

import { CvsSupportProvider } from "./cvsprovider";
import { GitSupportProvider } from "./gitprovider";
import { TfsSupportProvider } from "./tfsprovider";
import { VsCodeUtils } from "../utils/vscodeutils";
import { CvsProviderTypes } from "../utils/constants";

export class CvsSupportProviderFactory {

    /**
     * This method detects an active cvs provider and
     * @return an appropriate CvsSupportProvider implementation.
     * When particularProvider != undefined, this method returns requested CvsProvide.
     */
    public static async getCvsSupportProvider(particularProvider? : CvsProviderTypes) : Promise<CvsSupportProvider> {
        const activeCvs : CvsProviderTypes = particularProvider !== undefined ? particularProvider : await VsCodeUtils.getActiveScm();
        if (activeCvs === CvsProviderTypes.Git) {
            return new GitSupportProvider();
        }else if (activeCvs === CvsProviderTypes.Tfs) {
            return new TfsSupportProvider();
        }else {
            //TODO: think of behaviour in this case
        }
    }
}
