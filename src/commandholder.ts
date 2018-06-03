import {inject, injectable} from "inversify";
import {ParameterType, TYPES} from "./bll/utils/constants";
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
import {CustomizeBuild} from "./bll/commands/CustomizeBuild";
import {AddEditBuildParameter} from "./bll/commands/AddEditBuildParameter";
import {ParameterItem} from "./bll/entities/presentable/ParameterItem";
import {RemoveBuildParameter} from "./bll/commands/RemoveBuildParameter";
import {QueueAtTop} from "./bll/commands/QueueAtTop";
import {OpenInBrowser} from "./bll/commands/OpenInBrowser";
import {ChangeItem} from "./bll/entities/presentable/changeitem";

@injectable()
export class CommandHolder {

    constructor(@inject(TYPES.Output) private readonly output: Output,
                @inject(TYPES.SignIn) private readonly _signIn: SignIn,
                @inject(TYPES.SignOut) private readonly _signOut: SignOut,
                @inject(TYPES.SelectFilesForRemoteRun) private readonly _selectForRemoteRun: SelectFilesForRemoteRun,
                @inject(TYPES.GetSuitableConfigs) private readonly _getSuitableConfigs: GetSuitableConfigs,
                @inject(TYPES.RemoteRun) private readonly _remoteRun: RemoteRun,
                @inject(TYPES.ShowMyChangesCommand) private readonly _showMyChanges: ShowMyChanges,
                @inject(TYPES.ProviderManager) private readonly providerManager: IProviderManager,
                @inject(TYPES.CredentialsStore) private readonly credentialsStore?: CredentialsStore,
                @inject(TYPES.ResourceProvider) private readonly resourceProvider?: IResourceProvider,
                @inject(TYPES.BuildProvider) private readonly buildProvider?: IBuildProvider,
                @inject(TYPES.ChangesProvider) private readonly changesProvider?: IChangesProvider,
                @inject(TYPES.MessageManager) private readonly messageManager?: MessageManager,
                @inject(TYPES.CustomizeBuild) private readonly _customizeBuild?: CustomizeBuild,
                @inject(TYPES.AddEditBuildParameter) private readonly _addBuildParameter?: AddEditBuildParameter,
                @inject(TYPES.RemoveBuildParameter) private readonly _removeBuildParameter?: RemoveBuildParameter,
                @inject(TYPES.QueueAtTop) private readonly _queueAtTop?: QueueAtTop,
                @inject(TYPES.OpenInBrowser) private readonly _openInBrowser?: OpenInBrowser) {

        this.providerManager.showEmptyDataProvider();
    }

    public async signIn(fromPersistentStore: boolean = false): Promise<void> {
        await this.tryExecuteCommand(this._signIn, fromPersistentStore);
    }

    public async signOut(): Promise<void> {
        await this.tryExecuteCommand(this._signOut);
    }

    public async selectFilesForRemoteRun(): Promise<void> {
        if (await this.tryExecuteCommand(this._selectForRemoteRun)) {
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

    public async customizeBuild(buildConfigItem: BuildConfigItem) {
        await this.tryExecuteCommand(this._customizeBuild, buildConfigItem);
    }

    public async addParameter(type: ParameterType): Promise<void> {
        await this.tryExecuteCommand(this._addBuildParameter, type);
    }

    public async editParameter(param: ParameterItem): Promise<void> {
        await this.tryExecuteCommand(this._addBuildParameter, param);
    }

    public async removeParameter(param: ParameterItem): Promise<void> {
        await this.tryExecuteCommand(this._removeBuildParameter, param);
    }

    public async queueAtTop(): Promise<void> {
        await this.tryExecuteCommand(this._queueAtTop);
    }

    public async openInBrowser(presentableItem: BuildConfigItem | ChangeItem): Promise<void> {
        await this.tryExecuteCommand(this._openInBrowser, presentableItem);
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

}
