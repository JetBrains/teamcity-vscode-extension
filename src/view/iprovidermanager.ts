import {DataProviderEnum} from "../bll/utils/constants";
import {BuildConfig} from "../bll/entities/buildconfig";

export interface IProviderManager {
    showResourceProvider(): void;

    showBuildProvider(): void;

    showChangesProvider(): void;

    showEmptyChangesProvider(): void;

    showBuildSettingsProvider(build: BuildConfig): void;

    getShownDataProvider(): DataProviderEnum;

    refreshAll(): void;

    dispose();
}
