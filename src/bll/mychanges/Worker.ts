import {Disposable} from "vscode";
import {Utils} from "../utils/utils";
import {Logger} from "../utils/logger";
import {injectable} from "inversify";

@injectable()
export abstract class Worker implements Disposable {

    private shouldBeDisposed: boolean = false;

    public work() {
        this.workUnsafe().catch((err) => {
            Logger.logError(`${this.constructor.name} stopped working with error ${Utils.formatErrorMessage(err)}`);
        });
    }

    private async workUnsafe(): Promise<void> {
        await Utils.sleep(this.getInitialDelayInSeconds() * 1000);

        while (!this.shouldBeDisposed) {
            await this.mainFunction();
            await Utils.sleep(this.getDelayInSeconds() * 1000);
        }
    }

    protected abstract mainFunction(): Promise<void>;
    protected abstract getInitialDelayInSeconds(): number;
    protected abstract getDelayInSeconds(): number;

    public dispose() {
        this.shouldBeDisposed = true;
    }
}
