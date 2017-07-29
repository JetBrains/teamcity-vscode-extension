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
            const getProvider = new GitSupportProvider();
            await getProvider.init();
            return getProvider;
        }else if (activeCvs === CvsProviderTypes.Tfs) {
            const tfsProvider = new TfsSupportProvider();
            await tfsProvider.init();
            return tfsProvider;
        }else {
            //TODO: think of behaviour in this case
        }
    }
}
