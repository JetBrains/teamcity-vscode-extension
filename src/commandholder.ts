"use strict";

import {inject, injectable} from "inversify";
import {TYPES} from "./bll/utils/constants";
import {Output} from "./view/output";
import {ProviderManager} from "./view/providermanager";
import {GetSuitableConfigs} from "./bll/commands/getsuitableconfigs";
import {SelectFilesForRemoteRun} from "./bll/commands/selectfilesforremoterun";
import {SignIn} from "./bll/commands/signin";
import {RemoteRun} from "./bll/commands/remoterun";
import {SignOut} from "./bll/commands/signout";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";
import {ChangesProvider} from "./view/dataproviders/resourceprovider";
import {BuildProvider} from "./view/dataproviders/buildprovider";

@injectable()
export class CommandHolder {

    private output: Output;
    private _signIn: SignIn;
    private _signOut: SignOut;
    private _selectFilesForRemoteRun: SelectFilesForRemoteRun;
    private _getSuitableConfigs: GetSuitableConfigs;
    private _remoteRun: RemoteRun;
    private providerManager: ProviderManager;
    private credentialsStore: CredentialsStore;
    private resourceProvider: ChangesProvider;
    private buildProvider: BuildProvider;

    constructor(@inject(TYPES.Output) output: Output,
                @inject(TYPES.SignIn) signInCommand: SignIn,
                @inject(TYPES.SignOut) signOutCommand: SignOut,
                @inject(TYPES.SelectFilesForRemoteRun) selectFilesForRemoteRun: SelectFilesForRemoteRun,
                @inject(TYPES.GetSuitableConfigs) getSuitableConfigs: GetSuitableConfigs,
                @inject(TYPES.RemoteRun) remoteRun: RemoteRun,
                @inject(TYPES.ProviderManager) providerManager: ProviderManager,
                @inject(TYPES.CredentialsStore) credentialsStore?: CredentialsStore,
                @inject(TYPES.ResourceProvider) resourceProvider?: ChangesProvider,
                @inject(TYPES.BuildProvider) buildProvider?: BuildProvider) {
        this.output = output;
        this._signIn = signInCommand;
        this._signOut = signOutCommand;
        this._selectFilesForRemoteRun = selectFilesForRemoteRun;
        this._getSuitableConfigs = getSuitableConfigs;
        this._remoteRun = remoteRun;
        this.providerManager = providerManager;
        this.credentialsStore = credentialsStore;
        this.resourceProvider = resourceProvider;
        this.buildProvider = buildProvider;
    }

    public async signIn(fromPersistentStore: boolean = false): Promise<void> {
        await this._signIn.exec(fromPersistentStore);
        if (this.credentialsStore.getCredentialsSilently()) {
            this.providerManager.showEmptyDataProvider();
        }
    }

    public async signOut(): Promise<void> {
        await this._signOut.exec();
        this.providerManager.hideProviders();
    }

    public async selectFilesForRemoteRun(): Promise<void> {
        await this._selectFilesForRemoteRun.exec();
        this.providerManager.refreshAll();
        this.providerManager.showResourceProvider();
    }

    public async getSuitableConfigs(): Promise<void> {
        await this._getSuitableConfigs.exec();
        this.providerManager.refreshAll();
        this.providerManager.showBuildProvider();
    }

    public async remoteRunWithChosenConfigs(): Promise<void> {
        return this._remoteRun.exec();
    }

    public backToEmptyDataProvider(): void {
        this.resourceProvider.resetTreeContent();
        this.providerManager.showEmptyDataProvider();
    }

    public backToSelectFilesForRemoteRun(): void {
        this.buildProvider.resetTreeContent();
        this.providerManager.showResourceProvider();
    }

    public showOutput(): void {
        this.output.show();
    }
}
