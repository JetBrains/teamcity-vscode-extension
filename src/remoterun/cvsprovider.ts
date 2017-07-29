"use strict";
import { CheckinInfo } from "../utils/interfaces";

export interface CvsSupportProvider {
    getFormattedFilenames() : Promise<string[]>;
    generateConfigFileContent() : Promise<string>;
    getRequiredCheckinInfo() : Promise<CheckinInfo>;
    requestForPostCommit(checkinInfo : CheckinInfo);
    isActive() : Promise<boolean>;
}
