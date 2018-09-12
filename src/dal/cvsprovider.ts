import {CheckInInfo} from "../bll/entities/checkininfo";

export interface CvsSupportProvider {

    getRequiredCheckInInfo(): Promise<CheckInInfo>;

    commit(checkInInfo: CheckInInfo);

    getRootPath(): string;
}
