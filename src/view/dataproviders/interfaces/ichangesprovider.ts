import {TimePeriod} from "../../../bll/entities/timeperiod";

export interface IChangesProvider {
    resetTreeContent(): void;

    setContent(changes: TimePeriod[]): void;
}
