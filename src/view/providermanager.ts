"use strict";

import {commands} from "vscode";
import {EmptyDataProvider} from "./dataproviders/emptydataprovider";
import {DataProvider} from "./dataproviders/dataprovider";
import {injectable} from "inversify";
import {ResourceProvider} from "./dataproviders/resourceprovider";
import {BuildProvider} from "./dataproviders/buildprovider";

@injectable()
export class ProviderManager {
    private shownDataProvider: DataProvider;
    private readonly emptyDataProvider: EmptyDataProvider;
    private readonly resourcesProvider: ResourceProvider;
    private readonly buildsProvider: BuildProvider;

    constructor() {
        this.emptyDataProvider = new EmptyDataProvider();
        this.resourcesProvider = new ResourceProvider();
        this.buildsProvider = new BuildProvider();
        this.hideProviders();
    }

    public hideProviders(): void {
        commands.executeCommand("setContext", "teamcity-explorer", "");
        this.shownDataProvider = undefined;
    }

    public showEmptyDataProvider(): void {
        this.emptyDataProvider.show();
        this.shownDataProvider = this.emptyDataProvider;
    }

    public showResourceProvider(): void {
        this.resourcesProvider.show();
        this.shownDataProvider = this.resourcesProvider;
    }

    public showBuildProvider(): void {
        this.buildsProvider.show();
        this.shownDataProvider = this.buildsProvider;
    }

    public getShownDataProvider(): DataProviderEnum {
        return this.shownDataProvider ? this.shownDataProvider.getType() : undefined;
    }
}

export enum DataProviderEnum {
    EmptyDataProvider = "EmptyDataProvider",
    ResourcesProvider = "ResourcesProvider",
    BuildsProvider = "BuildsProvider"
}