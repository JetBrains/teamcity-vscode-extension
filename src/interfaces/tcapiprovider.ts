"use strict";

import {ProjectItem} from "../entities/projectitem";
import {Credentials} from "../credentialsstore/credentials";
import {SummaryDataProxy} from "../entities/summarydataproxy";

export interface TCApiProvider {
    /* async */
    checkCredential(credentials: Credentials): Promise<boolean>;
    /* async */
    getSuitableBuildConfigs(tcFormattedFilePaths: string[], credentials: Credentials): Promise<ProjectItem[]>;
    /* async */
    getTotalNumberOfEvents(credentials: Credentials): Promise<number>;
    /* async */
    getSummary(credentials: Credentials): Promise<SummaryDataProxy>;
}
