import {Logger} from "./bll/utils/logger";
import {TYPES} from "./bll/utils/constants";
import {inject, injectable} from "inversify";
import {CommandHolder} from "./commandholder";
import {Settings} from "./bll/entities/settings";
import {Output} from "./view/output";
import {TeamCityStatusBarItem} from "./view/teamcitystatusbaritem";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";
import {NotificationWatcher} from "./bll/notifications/notificationwatcher";
import {Disposable} from "vscode";
import {WorkspaceProxy} from "./bll/moduleproxies/workspace-proxy";
import {IProviderManager} from "./view/iprovidermanager";
import {WebLinkListener} from "./dal/weblinklistener";

@injectable()
export class ExtensionManager {
    private credentialsStore: CredentialsStore;
    private readonly _commandHolder: CommandHolder;
    private _notificationWatcher: NotificationWatcher;
    private readonly _disposables: Disposable[] = [];
    private readonly providerManager: IProviderManager;

    constructor(@inject(TYPES.Settings) settings: Settings,
                @inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore,
                @inject(TYPES.CommandHolder) commandHolder: CommandHolder,
                @inject(TYPES.NotificationWatcher) notificationWatcher: NotificationWatcher,
                @inject(TYPES.Output) output: Output,
                @inject(TYPES.ProviderManager) providerManager: IProviderManager,
                @inject(TYPES.TeamCityStatusBarItem) statusBarItem: TeamCityStatusBarItem,
                @inject(TYPES.WorkspaceProxy) workspaceProxy: WorkspaceProxy,
                @inject(TYPES.WebLinkListener) webLinkListener: WebLinkListener) {
        this.credentialsStore = credentialsStore;
        this._commandHolder = commandHolder;
        this._notificationWatcher = notificationWatcher;
        notificationWatcher.activate();
        this._disposables.push(notificationWatcher);
        this._disposables.push(output);
        this._disposables.push(statusBarItem);
        this._disposables.push(providerManager);
        this._disposables.push(webLinkListener);
        this.providerManager = providerManager;
        if (workspaceProxy.workspaceFolders && workspaceProxy.workspaceFolders.length !== 0) {
            const defaultWorkspace = workspaceProxy.workspaceFolders[0];
            this.initLogger(settings.loggingLevel, defaultWorkspace.uri.fsPath);
        }
        this.trySignInWithPersistentStorage();
    }

    public refreshAllProviders() {
        this.providerManager.refreshAll();
    }

    public dispose(): void {
        this._disposables.forEach((disposable) => disposable.dispose());
    }

    public get commandHolder(): CommandHolder {
        return this._commandHolder;
    }

    private initLogger(loggingLevel: string, rootPath: string): void {
        if (loggingLevel === undefined) {
            return;
        }
        Logger.SetLoggingLevel(loggingLevel);
        if (rootPath !== undefined) {
            Logger.LogPath = rootPath;
            Logger.logInfo(`Logger path: ${rootPath}`);
            Logger.logInfo(`Logging level: ${loggingLevel}`);
        } else {
            Logger.logWarning(`Folder not opened!`);
        }
    }

    private trySignInWithPersistentStorage() {
        this.commandHolder.signIn(true);
    }
}
