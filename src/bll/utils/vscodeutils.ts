import {extensions, version} from "vscode";
import {Constants} from "./constants";

export class VsCodeUtils {

    private static extensionVersion: string;

    public static getUserAgentString() : string {
        VsCodeUtils.extensionVersion = VsCodeUtils.extensionVersion || extensions.getExtension(Constants.EXTENSION_ID).packageJSON.version;
        return `${Constants.VISUAL_STUDIO_CODE}/${version} (TeamCity Integration ${VsCodeUtils.extensionVersion})`;
    }
}
