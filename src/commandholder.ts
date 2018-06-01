import {inject, injectable} from "inversify";
import {TYPES} from "./bll/utils/constants";
import {Output} from "./view/output";
import {GetSuitableConfigs} from "./bll/commands/getsuitableconfigs";
import {SelectFilesForRemoteRun} from "./bll/commands/selectfilesforremoterun";
import {SignIn} from "./bll/commands/signin";
import {RemoteRun} from "./bll/commands/remoterun";
import {SignOut} from "./bll/commands/signout";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";
import {ShowMyChanges} from "./bll/commands/showmychanges";
import {IResourceProvider} from "./view/dataproviders/interfaces/iresourceprovider";
import {IBuildProvider} from "./view/dataproviders/interfaces/ibuildprovider";
import {IProviderManager} from "./view/iprovidermanager";
import {IChangesProvider} from "./view/dataproviders/interfaces/ichangesprovider";
import {Logger} from "./bll/utils/logger";
import {Utils} from "./bll/utils/utils";
import {MessageManager} from "./view/messagemanager";
import {BuildConfigItem} from "./bll/entities/presentable/buildconfigitem";
import {ConfigureBuild} from "./bll/commands/ConfigureBuild";

@injectable()
export class CommandHolder {

    private output: Output;
    private readonly _signIn: SignIn;
    private readonly _signOut: SignOut;
    private readonly _selectFilesForRemoteRun: SelectFilesForRemoteRun;
    private readonly _getSuitableConfigs: GetSuitableConfigs;
    private readonly _remoteRun: RemoteRun;
    private readonly _showMyChanges: ShowMyChanges;
    private readonly _customizeBuild: ConfigureBuild;
    private providerManager: IProviderManager;
    private credentialsStore: CredentialsStore;
    private resourceProvider: IResourceProvider;
    private changesProvider: IChangesProvider;
    private buildProvider: IBuildProvider;
    private messageManager: MessageManager;

    constructor(@inject(TYPES.Output) output: Output,
                @inject(TYPES.SignIn) signInCommand: SignIn,
                @inject(TYPES.SignOut) signOutCommand: SignOut,
                @inject(TYPES.SelectFilesForRemoteRun) selectFilesForRemoteRun: SelectFilesForRemoteRun,
                @inject(TYPES.GetSuitableConfigs) getSuitableConfigs: GetSuitableConfigs,
                @inject(TYPES.RemoteRun) remoteRun: RemoteRun,
                @inject(TYPES.ShowMyChangesCommand) showMyChanges: ShowMyChanges,
                @inject(TYPES.ProviderManager) providerManager: IProviderManager,
                @inject(TYPES.CredentialsStore) credentialsStore?: CredentialsStore,
                @inject(TYPES.ResourceProvider) resourceProvider?: IResourceProvider,
                @inject(TYPES.BuildProvider) buildProvider?: IBuildProvider,
                @inject(TYPES.ChangesProvider) changesProvider?: IChangesProvider,
                @inject(TYPES.MessageManager) messageManager?: MessageManager) {
        this.output = output;
        this._signIn = signInCommand;
        this._signOut = signOutCommand;
        this._selectFilesForRemoteRun = selectFilesForRemoteRun;
        this._getSuitableConfigs = getSuitableConfigs;
        this._remoteRun = remoteRun;
        this._showMyChanges = showMyChanges;
        this._customizeBuild = new ConfigureBuild();
        this.providerManager = providerManager;
        this.credentialsStore = credentialsStore;
        this.resourceProvider = resourceProvider;
        this.buildProvider = buildProvider;
        this.changesProvider = changesProvider;
        this.messageManager = messageManager;
        this.providerManager.showEmptyDataProvider();
    }

    public async signIn(fromPersistentStore: boolean = false): Promise<void> {
        await this.tryExecuteCommand(this._signIn, fromPersistentStore);
    }

    public async signOut(): Promise<void> {
        await this.tryExecuteCommand(this._signOut);
    }

    public async selectFilesForRemoteRun(): Promise<void> {
        if (await this.tryExecuteCommand(this._selectFilesForRemoteRun)) {
            this.providerManager.refreshAll();
            this.providerManager.showResourceProvider();
        }
    }

    public async getSuitableConfigs(): Promise<void> {
        if (await this.tryExecuteCommand(this._getSuitableConfigs)) {
            this.providerManager.refreshAll();
            this.providerManager.showBuildProvider();
        }
    }

    public async remoteRunWithChosenConfigs(): Promise<void> {
        await this.tryExecuteCommand(this._remoteRun, false);
    }

    public async preTestedCommit(): Promise<void> {
        await this.tryExecuteCommand(this._remoteRun, true);
    }

    public backToEmptyDataProvider(): void {
        this.resourceProvider.resetTreeContent();
        this.providerManager.showEmptyDataProvider();
    }

    public backToBuildExplorer(): void {
        this.providerManager.showBuildProvider();
    }

    public backToSelectFilesForRemoteRun(): void {
        this.buildProvider.resetTreeContent();
        this.providerManager.showResourceProvider();
    }

    public showOutput(): void {
        this.output.show();
    }

    public async showMyChanges(): Promise<void> {
        if (await this.tryExecuteCommand(this._showMyChanges)) {
            this.providerManager.refreshAll();
            this.providerManager.showChangesProvider();
        }
    }

    private async tryExecuteCommand(command: Command, ...args: any[]): Promise<boolean> {
        try {
            if (args && args.length > 0) {
                await command.exec(args);
            } else {
                await command.exec();
            }
        } catch (err) {
            Logger.logError(`[tryExecuteCommand] ${err}`);
            this.messageManager.showErrorMessage(Utils.formatErrorMessage(err));
            return false;
        }
        return true;
    }

    public async customizeBuild(buildConfigItem: BuildConfigItem) {
        return this._customizeBuild.exec([buildConfigItem]);
    }
}
