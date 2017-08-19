"use strict";

import {PatchSender} from "./PatchSender";
import {Credentials} from "../credentialsstore/credentials";
import {CvsSupportProvider} from "./cvsprovider";
import {BuildConfigItem} from "../entities/buildconfigitem";

export interface PatchSender {
    /**
     * @returns true in case of success, otherwise false.
     */
    /* async */
    remoteRun(credentials: Credentials, configs: BuildConfigItem[], cvsProvider: CvsSupportProvider): Promise<boolean>;
}
