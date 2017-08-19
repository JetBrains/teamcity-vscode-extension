
import * as os from "os";
import { workspace } from "vscode";
import { Logger } from "../utils/logger";
import { CvsInfo } from "../utils/interfaces";
import * as cpprom from "child-process-promise";
import { CvsProviderTypes } from "../utils/constants";

export class TfsUtils {

    /**
     * This method allows to detect tf path and collect info about problems releted to the tfs cvs.
     * @return CvsInfo object
     * #cvsType: tfs;
     * #path: detected tfs path, path is undefined when tf path was not found;
     * #versionErrorMsg: is undefined if version is compativle, else a message witch contains about current and required versions;
     * #isChanged: is true if there are some changes / is false if there are no changes / is undefined if it's not a tfs workspace
     */
    public static async collectInfo() : Promise<CvsInfo> {
        const cvsInfo : CvsInfo = {
            cvsType: CvsProviderTypes.Tfs,
            path: undefined,
            versionErrorMsg: undefined,
            isChanged: undefined
        };
        try {
            const partialInfo : TfsPartialInfo = await TfsUtils.findTfs();
            Logger.logInfo(`TfsUtils#collectInfo: detected tfsPath is ${partialInfo.path}, version is ${partialInfo.version}`);
            cvsInfo.path = partialInfo.path;

            //TODO: understand which version is required. Currently, we don't check version, only collect it
            cvsInfo.versionErrorMsg = undefined;

            const briefDiffCommand : string = `tf diff /noprompt /format:brief /recursive "${workspace.rootPath}"`;
            Logger.logDebug(`TfsUtils#collectInfo: briefDiffCommand is ${briefDiffCommand}`);
            //If rootPath isn't tfs folder this command will generate the "Not a tfs repository" exception and
            //code will go to the catch block

            /* There are three possible cases here:
            * It is not a tfs workspace -> command will generate the "Unable to determine the workspace" exception :: isChanged = undefined
            * It is a tfs workspace but there are no changes here -> command will return empty stdout :: isChanged = false
            * It is a tfs workspace and there are some changes here -> command will return not empty stdout :: isChanged = true
            */
            const outBriefDiff = await cpprom.exec(briefDiffCommand);
            const briefDiffResults : string = outBriefDiff.stdout.toString("utf8").trim();
            cvsInfo.isChanged = !!briefDiffResults;
        } finally {
            Logger.logDebug(`GitUtils#collectInfo: path: ${cvsInfo.path},
                versionErrMsg: ${cvsInfo.versionErrorMsg},
                changed: ${cvsInfo.isChanged}`);
            return cvsInfo;
        }

    }

    private static async findTfs() : Promise<TfsPartialInfo> {
        const config = workspace.getConfiguration();
        let location = config.get<string>(SettingNames.Location, undefined);
        // Support replacing leading ~/ on macOS and linux
        if (location && location.startsWith("~/") &&
            (os.platform() === "darwin" || os.platform() === "linux")) {
            location = location.replace(/^~(\/)/, `${os.homedir()}$1`);
        }
        if (location) {
            location = location.trim();
        }

        return TfsUtils.findSpecificTfs(location)
        .then(void 0, () => TfsUtils.findSpecificTfs("tf"));
    }

    private static async findSpecificTfs(path: string): Promise<TfsPartialInfo> {
        const promiseResult = await cpprom.exec(path);
        const tfCommandResult : string = promiseResult.stdout.toString("utf8").trim();
        if (!tfCommandResult) {
            throw new Error("Not found");
        }

        return { path, version: TfsUtils.parseVersion(tfCommandResult) };
    }

    private static parseVersion(raw: string): string {
        const parseVersionRegExp : RegExp = /, Version (.*?)(\r\n|\n)/;
        const match = parseVersionRegExp.exec(raw);
        return match[1];
    }
}

class SettingNames {
    public static get Location(): string { return "tfvc.location"; }
}

interface TfsPartialInfo {
    path : string;
    version : string;
}
