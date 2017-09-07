"use strict";

import * as os from "os";
import {workspace} from "vscode";
import * as cpprom from "child-process-promise";
import {Constants} from "../utils/constants";

export class TfsUtils {

    public static async getPath(): Promise<string> {
        try {
            return await TfsUtils.findTfsPath();
        } catch (err) {
            throw new Error("tfvc command line util not found");
        }
    }

    private static async findTfsPath(): Promise<string> {
        const config = workspace.getConfiguration();
        let location = config.get<string>(Constants.TFS_LOCATION_SETTING_NAME, undefined);
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

    private static async findSpecificTfs(path: string): Promise<string> {
        const promiseResult = await cpprom.exec(`"${path}"`);
        const tfCommandResult: string = promiseResult.stdout.toString("utf8").trim();
        if (!tfCommandResult) {
            throw new Error("tfvc command line util not found");
        }

        return path;
    }

    private static parseVersion(raw: string): string {
        const parseVersionRegExp: RegExp = /, Version (.*?)(\r\n|\n)/;
        const matches = parseVersionRegExp.exec(raw);
        const version: string = matches[1];
        return version;
    }

    public static async checkIsActive(path: string): Promise<void> {
        //TODO: understand which version is required. Currently, we don't check version
        await TfsUtils.checkIsTfsRepository(path);
        await this.checkChangedFilesPresence(path);
    }

    private static async checkIsTfsRepository(path: string): Promise<void> {
        const briefDiffCommand: string = `"${path}" diff /noprompt /format:brief /recursive "${workspace.rootPath}"`;
        try {
            await cpprom.exec(briefDiffCommand);
        } catch (err) {
            throw new Error("Tfs repository was not determined");
        }
    }

    private static async checkChangedFilesPresence(path: string): Promise<void> {
        const briefDiffCommand: string = `"${path}" diff /noprompt /format:brief /recursive "${workspace.rootPath}"`;
        const outBriefDiff = await cpprom.exec(briefDiffCommand);
        const briefDiffResults: string = outBriefDiff.stdout.toString("utf8").trim();
        const changedFilesPresence: boolean = !!briefDiffResults;
        if (!changedFilesPresence) {
            throw new Error("There are no changed files in tfvs");
        }
    }

}
