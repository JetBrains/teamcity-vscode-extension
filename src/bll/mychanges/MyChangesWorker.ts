import {Worker} from "./Worker";
import {TYPES} from "../utils/constants";
import {inject, injectable} from "inversify";
import {ShowMyChanges} from "../commands/showmychanges";

@injectable()
export class MyChangesWorker extends Worker {

    constructor(@inject(TYPES.ShowMyChangesCommand) private readonly showMyChangesCommand: ShowMyChanges) {
        super();
    }

    mainFunction(): Promise<void> {
        return this.showMyChangesCommand.exec([true]);
    }

    getDelayInSeconds(): number {
        return 120;
    }

    getInitialDelayInSeconds(): number {
        return 15;
    }
}
