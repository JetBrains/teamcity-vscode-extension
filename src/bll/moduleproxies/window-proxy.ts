import {CancellationToken, InputBoxOptions, window} from "vscode";
import {injectable} from "inversify";

@injectable()
export class WindowProxy {

    public async showInputBox(options?: InputBoxOptions, token?: CancellationToken): Promise<string | undefined> {
        return window.showInputBox(options, token);
    }
}
