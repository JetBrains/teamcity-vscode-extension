import {injectable} from "inversify";
import {Uri} from "vscode";

@injectable()
export class UriProxy {

    public readonly fsPath: string;
    public readonly path: string;

    public file(path: string): Uri {
        return Uri.file(path);
    }
}
