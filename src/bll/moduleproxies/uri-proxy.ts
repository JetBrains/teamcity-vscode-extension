import {injectable} from "inversify";
import {Uri} from "vscode";

@injectable()
export class UriProxy {

    public file(path: string): Uri {
        return Uri.file(path);
    }
}
