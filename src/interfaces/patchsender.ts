"use strict";

import {PatchSender} from "./PatchSender";
import {CvsSupportProvider} from "./cvsprovider";
import {BuildConfigItem} from "../entities/buildconfigitem";

export interface PatchSender {
    /**
     * @returns true in case of success, otherwise false.
     */
    /* async */
    remoteRun(configs: BuildConfigItem[], cvsProvider: CvsSupportProvider): Promise<boolean>;
}
