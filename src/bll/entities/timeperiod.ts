import {Change} from "./change";
import {TimePeriodEnum} from "../utils/constants";

export class TimePeriod {

    public readonly changes: Change[];
    public readonly timePeriod: TimePeriodEnum;

    constructor(timePeriod: TimePeriodEnum, changes: Change[]) {
        this.timePeriod = timePeriod;
        this.changes = changes ?  changes : [];
    }
}
