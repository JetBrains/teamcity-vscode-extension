"use strict";

import { CvsSupportProvider } from "./cvsprovider";
import { GitSupportProvider } from "./gitprovider";
import { TfsSupportProvider } from "./tfsprovider";
import { VsCodeUtils } from "../utils/vscodeutils";
import { CvsProviderTypes } from "../utils/constants";
import { Logger } from "../utils/logger";

export class CvsSupportProviderFactory {

    /**
     * This method detects an active cvs provider and
     * @return an appropriate CvsSupportProvider implementation.
     * When particularProvider != undefined, this method returns requested CvsProvide, but without initialization;
     */
    public static async getCvsSupportProvider(particularProvider? : CvsProviderTypes) : Promise<CvsSupportProvider> {
        const activeCvs : CvsProviderTypes = particularProvider !== undefined ? particularProvider : await VsCodeUtils.getActiveScm();
        Logger.logDebug(`CvsSupportProviderFactory#getCvsSupportProvider: particularProvider is${particularProvider ? "" : " not"} setted, activeCvs is ${activeCvs.toString}`);
        if (activeCvs === CvsProviderTypes.Git) {
            const getProvider = new GitSupportProvider();
            if (!particularProvider) {
                await getProvider.init();
            }
            return getProvider;
        }else if (activeCvs === CvsProviderTypes.Tfs) {
            const tfsProvider = new TfsSupportProvider();
            if (!particularProvider) {
                await tfsProvider.init();
            }
            return tfsProvider;
        }else {
            Logger.logWarning(`CvsSupportProviderFactory#getCvsSupportProvider: cvs not found!`);
            //TODO: think of behaviour in this case
        }
    }
}
