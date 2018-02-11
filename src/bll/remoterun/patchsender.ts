"use strict";

import {PatchSender} from "./patchsender";
import {CheckInInfo} from "../entities/checkininfo";
import {BuildConfig} from "../entities/buildconfig";

export interface PatchSender {

    /**
     * @returns true in case of success, otherwise false.
     */
    remoteRun(configs: BuildConfig[], checkInInfo: CheckInInfo[]): Promise<boolean>;
}
