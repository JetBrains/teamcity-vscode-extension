"use strict";

import {PatchSender} from "./patchsender";
import {BuildConfigItem} from "../entities/buildconfigitem";
import {CheckInInfo} from "../entities/checkininfo";

export interface PatchSender {

    /**
     * @returns true in case of success, otherwise false.
     */
    remoteRun(configs: BuildConfigItem[], checkInInfo: CheckInInfo[]): Promise<boolean>;
}
