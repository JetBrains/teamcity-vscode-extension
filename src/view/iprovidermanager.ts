import {DataProviderEnum} from "../bll/utils/constants";

export interface IProviderManager {
    hideProviders(): void;

    showEmptyDataProvider(): void;

    showResourceProvider(): void;

    showBuildProvider(): void;

    showChangesProvider(): void;

    getShownDataProvider(): DataProviderEnum;

    refreshAll(): void;

    dispose();
}
