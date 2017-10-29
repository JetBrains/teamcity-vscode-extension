"use strict";

import {CheckInInfo} from "../bll/entities/checkininfo";
import {ReadableSet} from "../bll/utils/readableset";
import {CvsLocalResource} from "../bll/entities/cvsresources/cvslocalresource";

export interface CvsSupportProvider {

    getFormattedFileNames(checkInInfo: CheckInInfo): Promise<string[]>;

    getRequiredCheckInInfo(): Promise<CheckInInfo>;

    commit(checkInInfo: CheckInInfo);

    commitAndPush(checkInInfo: CheckInInfo);

    getStagedFileContentStream(fileAbsPath: CvsLocalResource): Promise<ReadableSet> | undefined;

    getRootPath(): string;

    allowStaging(): boolean;
}
