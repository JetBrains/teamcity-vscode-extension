import {BuildConfig} from "../../../bll/entities/buildconfig";

export interface IBuildSettingsProvider {
    setBuild(buildConfig: BuildConfig): void;
    getCurrentBuild(): BuildConfig;
}
