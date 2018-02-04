import {extensions, version} from "vscode";
import {Constants} from "./constants";
import {IVsCodeUtils} from "./ivscodeutils";
import {injectable} from "inversify";

@injectable()
export class VsCodeUtils implements IVsCodeUtils {

    private extensionVersion: string;

    public getUserAgentString(): string {
        this.extensionVersion = this.extensionVersion || extensions.getExtension(Constants.EXTENSION_ID).packageJSON.version;
        return `${Constants.VISUAL_STUDIO_CODE}/${version} (TeamCity Integration ${this.extensionVersion})`;
    }
}
