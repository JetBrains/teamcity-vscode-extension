
import * as os from "os";
import { CvsInfo } from "../utils/interfaces";
import { CvsProviderTypes } from "../utils/constants";
import { Logger } from "../utils/logger";
import { workspace } from "vscode";
import * as cp from "child_process";
import * as cpprom from "child-process-promise";

export class TfsUtils {
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
            cvsInfo.isChanged = briefDiffResults && true;
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
