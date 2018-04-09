import {CancellationToken, InputBoxOptions, TextDocumentShowOptions, TextEditor, Uri, window} from "vscode";
import {injectable} from "inversify";

@injectable()
export class WindowProxy {

    public async showInputBox(options?: InputBoxOptions, token?: CancellationToken): Promise<string | undefined> {
        return window.showInputBox(options, token);
    }

    public async showTextDocument(uri: Uri, options?: TextDocumentShowOptions): Promise<TextEditor> {
        return window.showTextDocument(uri, options);
    }
}
