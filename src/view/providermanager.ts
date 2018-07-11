import {Disposable, window} from "vscode";
import {DataProvider} from "./dataproviders/dataprovider";
import {inject, injectable} from "inversify";
import {ResourceProvider} from "./dataproviders/resourceprovider";
import {BuildProvider} from "./dataproviders/buildprovider";
import {DataProviderEnum, TYPES} from "../bll/utils/constants";
import {IProviderManager} from "./iprovidermanager";
import {ChangesProvider} from "./dataproviders/changesprovider";
import {BuildSettingsProvider} from "./dataproviders/BuildSettingsProvider";
import {BuildConfig} from "../bll/entities/buildconfig";

@injectable()
export class ProviderManager implements IProviderManager {

    private shownDataProvider: DataProvider;
    private readonly toDispose: Disposable[] = [];

    constructor(@inject(TYPES.ResourceProvider) private readonly resourcesProvider: ResourceProvider,
                @inject(TYPES.BuildProvider) private readonly buildsProvider: BuildProvider,
                @inject(TYPES.ChangesProvider) private readonly changesProvider: ChangesProvider,
                @inject(TYPES.BuildSettingsProvider) private readonly buildSettingsProvider: BuildSettingsProvider) {

        if (resourcesProvider && buildsProvider && changesProvider && buildSettingsProvider) {
            this.toDispose.push(window.registerTreeDataProvider("teamcityResourceExplorer", resourcesProvider));
            this.toDispose.push(window.registerTreeDataProvider("teamcityBuildsExplorer", buildsProvider));
            this.toDispose.push(window.registerTreeDataProvider("teamcityChangesProvider", changesProvider));
            this.toDispose.push(window.registerTreeDataProvider("teamcityBuildSettingsProvider", buildSettingsProvider));
        }

        this.showChangesProvider();
    }

    public showResourceProvider(): void {
        this.resourcesProvider.show();
        this.shownDataProvider = this.resourcesProvider;
    }

    public showBuildProvider(): void {
        this.buildsProvider.show();
        this.shownDataProvider = this.buildsProvider;
    }

    public showChangesProvider(): void {
        this.changesProvider.show();
        this.shownDataProvider = this.changesProvider;
    }

    public showBuildSettingsProvider(build: BuildConfig): void {
        this.buildSettingsProvider.setBuild(build);
        this.buildSettingsProvider.show();
        this.shownDataProvider = this.buildSettingsProvider;
    }

    public getShownDataProvider(): DataProviderEnum {
        return this.shownDataProvider ? this.shownDataProvider.getType() : undefined;
    }

    public refreshAll() {
        if (this.resourcesProvider && this.changesProvider && this.buildsProvider) {
            this.resourcesProvider.refreshTreePresentation();
            this.buildsProvider.refreshTreePresentation();
            this.changesProvider.refreshTreePresentation();
        }
    }

    public resetAll() {
        if (this.resourcesProvider && this.changesProvider && this.buildsProvider) {
            this.resourcesProvider.resetTreeContent();
            this.buildsProvider.resetTreeContent();
            this.changesProvider.resetTreeContent();
        }
    }

    public dispose() {
        this.toDispose.forEach((toDispose) => {
            toDispose.dispose();
        });
    }
}
