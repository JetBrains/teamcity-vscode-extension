import {inject, injectable} from "inversify";
import {ParameterType, TYPES} from "./bll/utils/constants";
import {GetSuitableConfigs} from "./bll/commands/getsuitableconfigs";
import {SelectFilesForRemoteRun} from "./bll/commands/selectfilesforremoterun";
import {SignIn} from "./bll/commands/signin";
import {RemoteRun} from "./bll/commands/remoterun";
import {SignOut} from "./bll/commands/signout";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";
import {ShowMyChanges} from "./bll/commands/showmychanges";
import {IProviderManager} from "./view/iprovidermanager";
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
import {BuildConfig} from "./bll/entities/buildconfig";

@injectable()
export class CommandHolder {

    constructor(@inject(TYPES.SignIn) private readonly _signIn: SignIn,
                @inject(TYPES.SignOut) private readonly _signOut: SignOut,
                @inject(TYPES.SelectFilesForRemoteRun) private readonly _selectForRemoteRun: SelectFilesForRemoteRun,
                @inject(TYPES.GetSuitableConfigs) private readonly _getSuitableConfigs: GetSuitableConfigs,
                @inject(TYPES.RemoteRun) private readonly _remoteRun: RemoteRun,
                @inject(TYPES.ShowMyChangesCommand) private readonly _showMyChanges: ShowMyChanges,
                @inject(TYPES.ProviderManager) private readonly providerManager: IProviderManager,
                @inject(TYPES.CredentialsStore) private readonly credentialsStore: CredentialsStore,
                @inject(TYPES.CustomizeBuild) private readonly _customizeBuild: CustomizeBuild,
                @inject(TYPES.AddEditBuildParameter) private readonly _addBuildParameter: AddEditBuildParameter,
                @inject(TYPES.RemoveBuildParameter) private readonly _removeBuildParameter: RemoveBuildParameter,
                @inject(TYPES.QueueAtTop) private readonly _queueAtTop: QueueAtTop,
                @inject(TYPES.OpenInBrowser) private readonly _openInBrowser: OpenInBrowser,
                @inject(TYPES.MessageManager) private readonly messageManager: MessageManager) {
        //
    }

    public async signIn(fromPersistentStore: boolean = false): Promise<void> {
        if (await this.tryExecuteCommand(this._signIn, fromPersistentStore) &&
            this.credentialsStore.getCredentialsSilently()) {
            await this.showMyChanges(true);
        }
    }

    public async signOut(): Promise<void> {
        if (await this.tryExecuteCommand(this._signOut)) {
            this.providerManager.resetAll();
            this.providerManager.showChangesProvider();
        }
    }

    public async selectFilesForRemoteRun(): Promise<void> {
        try {
            const loggedIn = await this.credentialsStore.getCredentials();
            if (loggedIn && await this.tryExecuteCommand(this._selectForRemoteRun)) {
                this.providerManager.showResourceProvider();
            }
        } catch (err) {
            Logger.logError(`[selectFilesForRemoteRun]  ${Utils.formatErrorMessageForLogging(err)}`);
            this.messageManager.showErrorMessage(Utils.formatErrorMessage(err));
        }
    }

    public async getSuitableConfigs(): Promise<void> {
        if (await this.tryExecuteCommand(this._getSuitableConfigs)) {
            this.providerManager.showBuildProvider();
        }
    }

    public async remoteRunWithChosenConfigs(): Promise<void> {
        await this.tryExecuteCommand(this._remoteRun, false);
    }

    public async preTestedCommit(): Promise<void> {
        await this.tryExecuteCommand(this._remoteRun, true);
    }

    public async backToChangesDataProvider(): Promise<void> {
        this.providerManager.showChangesProvider();

        return this.showMyChanges(true);
    }

    public backToBuildExplorer(): void {
        this.providerManager.showBuildProvider();
    }

    public backToSelectFilesForRemoteRun(): void {
        this.providerManager.showResourceProvider();
    }

    public async showMyChanges(isSilent: boolean = false): Promise<void> {
        if (await this.tryExecuteCommand(this._showMyChanges, isSilent)) {
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
        let result:boolean | void;
        try {
            if (args && args.length > 0) {
                result = await command.exec(args);
            } else {
                result = await command.exec();
            }
            if (typeof result === "boolean") {
                return result;
            }
        } catch (err) {
            Logger.logError(`[tryExecuteCommand] ${Utils.formatErrorMessageForLogging(err)}`);
            this.messageManager.showErrorMessage(Utils.formatErrorMessage(err));
            return false;
        }
        return true;
    }

    public static resetBuildConfiguration(buildConfigItem: BuildConfigItem) {
        const build: BuildConfig = buildConfigItem.entity;
        build.resetCustomization();
    }
}
