import {Change} from "./change";

export class TimePeriod {

    public readonly changes: Change[];
    public readonly name: string;

    constructor(name: string, changes: Change[]) {
        this.name = name;
        this.changes = changes ?  changes : [];
    }
}
