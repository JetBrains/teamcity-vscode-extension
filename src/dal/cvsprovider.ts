"use strict";

import {CheckInInfo} from "../bll/entities/checkininfo";
import {ReadableSet} from "../bll/utils/readableset";
import {CvsResource} from "../bll/entities/cvsresources/cvsresource";

export interface CvsSupportProvider {

    getFormattedFileNames(checkInInfo: CheckInInfo): Promise<string[]>;

    getRequiredCheckInInfo(): Promise<CheckInInfo>;

    commit(checkInInfo: CheckInInfo);

    commitAndPush(checkInInfo: CheckInInfo);

    getStagedFileContentStream(fileAbsPath: CvsResource): Promise<ReadableSet> | undefined;

    getRootPath(): string;

    allowStaging(): boolean;
}
