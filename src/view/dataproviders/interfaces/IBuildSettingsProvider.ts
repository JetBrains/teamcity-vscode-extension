import {BuildConfig} from "../../../bll/entities/buildconfig";

export interface IBuildSettingsProvider {
    resetTreeContent(): void;

    setContent(projects: BuildConfig): void;
}
