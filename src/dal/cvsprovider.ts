import {CheckInInfo} from "../bll/entities/checkininfo";

export interface CvsSupportProvider {

    getFormattedFileNames(checkInInfo: CheckInInfo): Promise<string[]>;

    getRequiredCheckInInfo(): Promise<CheckInInfo>;

    commit(checkInInfo: CheckInInfo);

    getRootPath(): string;
}
