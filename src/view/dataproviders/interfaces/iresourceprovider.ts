import {CheckInInfo} from "../../../bll/entities/checkininfo";

export interface IResourceProvider {
    setContent(checkInArray: CheckInInfo[]): void;

    getSelectedContent(): CheckInInfo[];

    resetTreeContent(): void;
}
