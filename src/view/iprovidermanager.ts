import {DataProviderEnum} from "../bll/utils/constants";
import {BuildConfig} from "../bll/entities/buildconfig";

export interface IProviderManager {
    showResourceProvider(): void;

    showBuildProvider(): void;

    showChangesProvider(): void;

    showBuildSettingsProvider(build: BuildConfig): void;

    getShownDataProvider(): DataProviderEnum;

    refreshAll(): void;

    resetAll(): void;

    dispose();
}
