"use strict";

import {CvsSupportProvider} from "../../dal/cvsprovider";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";

@injectable()
export class CvsSupportProviderFactory {

    private cvsProviders: CvsSupportProvider[] = [];

    constructor (@inject(TYPES.GitProvider)gitProvider: CvsSupportProvider,
                 @inject(TYPES.TfvcProvider)tfvcProvider: CvsSupportProvider) {
        if (gitProvider) {
            this.cvsProviders.push(gitProvider);
        }
        if (tfvcProvider) {
            this.cvsProviders.push(tfvcProvider);
        }
    }

    /**
     * This method detects an active cvs provider and
     * @return an appropriate CvsSupportProvider implementation.
     * When particularProvider != undefined, this method returns requested CvsProvide, but without initialization;
     */
    public async getCvsSupportProviders(): Promise<CvsSupportProvider[]> {
        const checkedCvsProviders: CvsSupportProvider[] = [];
        this.cvsProviders.forEach((cvsProvider) => {
            if (cvsProvider && cvsProvider.isActive) {
                checkedCvsProviders.push(cvsProvider);
            }
        });
        return Promise.resolve<CvsSupportProvider[]>(checkedCvsProviders);
    }
}
