import * as path from "path";
import {Uri} from "vscode";
import {LeaveSelectableItem} from "./leaveselectableitem";
import {BuildConfig} from "../buildconfig";

export class BuildConfigItem extends LeaveSelectableItem {
    private readonly buildConfig: BuildConfig;

    constructor(buildConfig: BuildConfig) {
        super(buildConfig.name);
        this.buildConfig = buildConfig;
    }

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName: string = "config - " + (this.isIncluded ? "incl" : "excl") + ".png";
        return {
            light: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "dark", iconName)
        };
    }

    public get id(): string {
        return this.buildConfig.id;
    }

    public get externalId(): string {
        return this.buildConfig.externalId;
    }

    public get entity(): BuildConfig {
        return this.buildConfig;
    }
}
