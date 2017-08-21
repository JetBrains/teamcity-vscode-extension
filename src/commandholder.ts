"use strict";

import {
    Disposable,
    extensions,
    MessageItem,
    OutputChannel,
    QuickDiffProvider,
    scm,
    SourceControlInputBox,
    SourceControlResourceState,
    window,
    workspace,
    WorkspaceEdit
} from "vscode";
import {Logger} from "./utils/logger";
import {XmlParser} from "./bll/xmlparser";
import {RemoteLogin} from "./dal/remotelogin";
import {VsCodeUtils} from "./utils/vscodeutils";
import {IRemoteLogin} from "./dal/iremotelogin";
import {ProjectItem} from "./entities/projectitem";
import {ExtensionManager} from "./extensionmanager";
import {CheckInInfo} from "./interfaces/checkininfo";
import {PatchSender} from "./interfaces/PatchSender";
import {RemoteBuildServer} from "./dal/remotebuldserver";
import {MessageConstants} from "./utils/MessageConstants";
import {Credentials} from "./credentialsstore/credentials";
import {BuildConfigItem} from "./entities/buildconfigitem";
import {IRemoteBuildServer} from "./dal/iremotebuildserver";
import {CvsSupportProvider} from "./interfaces/cvsprovider";
import {CvsLocalResource} from "./entities/cvslocalresource";
import {CustomPatchSender} from "./remoterun/custompatchsender";
import {CvsSupportProviderFactory} from "./remoterun/cvsproviderfactory";

export class CommandHolder {
    private _extManager: ExtensionManager;
    private _cvsProvider: CvsSupportProvider;
    private _remoteLogin: IRemoteLogin;
    private _remoteBuildServer: IRemoteBuildServer;

    public constructor(extManager: ExtensionManager) {
        this._extManager = extManager;
    }

    public async signIn() {
        Logger.logInfo("CommandHolder#signIn: starts");
        let signedIn: boolean = false;
        let credentials: Credentials;
        //try getting credentials from keytar
        try {
            const keytar = require("keytar");
            Logger.logDebug(`CommandHolder#signIn: keytar is supported. Good job user.`);
            const serverUrl = await keytar.getPassword("teamcity", "serverurl");
            const user = await keytar.getPassword("teamcity", "username");
            const password = await keytar.getPassword("teamcity", "password");
            if (serverUrl && user && password) {
                this._remoteLogin = new RemoteLogin(serverUrl);
                const loginInfo: string[] = VsCodeUtils.parseValueColonValue(await this._remoteLogin.authenticate(user, password));
                const sessionId = loginInfo[0];
                const userId = loginInfo[1];
                credentials = new Credentials(serverUrl, user, password, userId, sessionId);
                signedIn = !!loginInfo;
            }
            Logger.logDebug(`CommandHolder#signIn: password was${signedIn ? "" : " not"} found at keytar.`);
        } catch (err) {
            Logger.logError(`CommandHolder#signIn: Unfortunately storing a password is not supported. The reason: ${VsCodeUtils.formatErrorMessage(err)}`);
        }

        if (!signedIn) {
            credentials = await this.requestTypingCredentials();
            signedIn = !!credentials;
        }

        if (signedIn) {
            this._extManager.credentialStore.setCredential(credentials);
            Logger.logInfo("CommandHolder#signIn: success");
            if (this._extManager.settings.showSignInWelcome) {
                this.showWelcomeMessage();
            }
            this.storeLastUserCredentials(credentials);

            this._remoteBuildServer = new RemoteBuildServer(credentials.serverURL, credentials.sessionId);
            this._extManager.notificationWatcher.activate();
        } else {
            Logger.logWarning("CommandHolder#signIn: failed");
        }
    }

    public async selectFilesForRemoteRun() {
        Logger.logInfo("CommandHolder#selectFilesForRemoteRun: starts");
        this._cvsProvider = await CvsSupportProviderFactory.getCvsSupportProvider();
        if (this._cvsProvider === undefined) {
            //If there is no provider, log already contains message about the problem
            return;
        }
        const checkInInfo: CheckInInfo = await this._cvsProvider.getRequiredCheckInInfo();
        this._extManager.configurationExplorer.setExplorerContent(checkInInfo.cvsLocalResources);
        this._extManager.configurationExplorer.refresh();
    }

    public async getSuitableConfigs() {
        Logger.logInfo("CommandHolder#getSuitableConfigs: starts");
        const credentials: Credentials = await this.tryGetCredentials();
        if (credentials === undefined) {
            //If there are no credentials, log already contains message about the problem
            return;
        }
        // const apiProvider: TCApiProvider = new TCXmlRpcApiProvider();
        const selectedResources: CvsLocalResource[] = this._extManager.configurationExplorer.getInclResources();
        if (selectedResources && selectedResources.length > 0) {
            this._cvsProvider.setFilesForRemoteRun(selectedResources);
        } else {
            this._cvsProvider = await CvsSupportProviderFactory.getCvsSupportProvider();
        }

        if (this._cvsProvider === undefined) {
            //If there is no provider, log already contains message about the problem
            return;
        }
        const tcFormattedFilePaths: string[] = await this._cvsProvider.getFormattedFileNames();

        /* get suitable build configs hierarchically */
        const shortBuildConfigNames : string[] = await this._remoteBuildServer.getSuitableConfigurations(tcFormattedFilePaths);
        const buildXmlArray : string[] = await this._remoteBuildServer.getRelatedBuilds(shortBuildConfigNames);
        const projects: ProjectItem[] = await XmlParser.parseBuilds(buildXmlArray);
        this.filterConfigs(projects, shortBuildConfigNames);

        if (projects && projects.length > 0) {
            await this._extManager.settings.setEnableRemoteRun(true);
        }
        this._extManager.configurationExplorer.setExplorerContent(projects);
        this._extManager.configurationExplorer.refresh();
        VsCodeUtils.showInfoMessage("[TeamCity] Please specify builds for remote run.");
        Logger.logInfo("CommandHolder#getSuitableConfigs: finished");
    }

    /**
     *
     * @param projects - array of ProjectItems that contain all project's buildConfigs.
     * @param configurationIds - array of ids of suitable build configs.
     * @return - contains at the first arg, not at @return clause. List of projects with only suitable build configs.
     */
    private filterConfigs(projects: ProjectItem[], configurationIds: string[]) {
        projects.forEach((project) => {
            const filteredConfigs: BuildConfigItem[] = [];
            project.configs.forEach((configuration) => {
                if (configurationIds.indexOf(configuration.id) !== -1) {
                    filteredConfigs.push(configuration);
                }
            });
            project.configs = filteredConfigs;
        });
    }

    public async remoteRunWithChosenConfigs() {
        Logger.logInfo("CommandHolder#remoteRunWithChosenConfigs: starts");
        const credentials: Credentials = await this.tryGetCredentials();
        if (!credentials || !this._cvsProvider) {
            Logger.logWarning("CommandHolder#remoteRunWithChosenConfigs: credentials or cvsProvider absents. Try to sign in again");
            return;
        }
        const includedBuildConfigs: BuildConfigItem[] = this._extManager.configurationExplorer.getIncludedBuildConfigs();
        if (includedBuildConfigs === undefined || includedBuildConfigs.length === 0) {
            VsCodeUtils.displayNoSelectedConfigsMessage();
            Logger.logWarning("CommandHolder#remoteRunWithChosenConfigs: no selected build configs. Try to execute the 'GitRemote run' command");
            return;
        }

        await this._extManager.settings.setEnableRemoteRun(false);
        this._extManager.configurationExplorer.setExplorerContent([]);
        this._extManager.configurationExplorer.refresh();
        const patchSender: PatchSender = new CustomPatchSender(credentials);
        const remoteRunResult: boolean = await patchSender.remoteRun(includedBuildConfigs, this._cvsProvider);
        if (remoteRunResult) {
            Logger.logInfo("CommandHolder#remoteRunWithChosenConfigs: remote run is ok");
            this._cvsProvider.requestForPostCommit();
        } else {
            Logger.logWarning("CommandHolder#remoteRunWithChosenConfigs: something went wrong during remote run");
        }
        Logger.logInfo("CommandHolder#remoteRunWithChosenConfigs: finishes");
    }

    private getDefaultURL(): string {
        return this._extManager.settings.getLastUrl();
    }

    private getDefaultUsername(): string {
        return this._extManager.settings.getLastUsername();
    }

    public changeConfigState(config: BuildConfigItem) {
        config.changeState();
        this._extManager.configurationExplorer.refresh();
    }

    public changeCollapsibleState(project: ProjectItem) {
        project.changeCollapsibleState();
    }

    public async signOut(): Promise<void> {
        Logger.logInfo("CommandHolder#signOut: starts");
        this._extManager.cleanUp();
        Logger.logInfo("CommandHolder#signOut: finished");
    }

    public async tryGetCredentials(): Promise<Credentials> {
        let credentials: Credentials = this._extManager.credentialStore.getCredential();
        if (!credentials) {
            Logger.logInfo("CommandHolder#tryGetCredentials: credentials is undefined. An attempt to get them");
            await this.signIn();
            credentials = this._extManager.credentialStore.getCredential();
            if (!credentials) {
                VsCodeUtils.displayNoCredentialsMessage();
                Logger.logWarning("CommandHolder#tryGetCredentials: An attempt to get credentials failed");
                return undefined;
            }
        }
        Logger.logInfo("CommandHolder#tryGetCredentials: success");
        return credentials;
    }

    private async showWelcomeMessage() {
        const DO_NOT_SHOW_AGAIN = "Don't show again";
        const WELCOME_MESSAGE = "You are successfully logged in. Welcome to the TeamCity extension!";
        const messageItems: MessageItem[] = [];
        messageItems.push({title: DO_NOT_SHOW_AGAIN});
        const chosenItem: MessageItem = await VsCodeUtils.showInfoMessage(WELCOME_MESSAGE, ...messageItems);
        if (chosenItem && chosenItem.title === DO_NOT_SHOW_AGAIN) {
            this._extManager.settings.setShowSignInWelcome(false);
        }
    }

    private async requestTypingCredentials(): Promise<Credentials> {
        const defaultURL: string = this.getDefaultURL();
        const defaultUsername: string = this.getDefaultUsername();

        let serverUrl: string = await window.showInputBox({
            value: defaultURL || "",
            prompt: MessageConstants.PROVIDE_URL,
            placeHolder: "",
            password: false
        });
        if (!serverUrl) {
            //It means that user clicked "Esc": abort the operation
            Logger.logDebug("CommandHolder#signIn: abort after serverUrl inputBox");
            return;
        } else {
            //to prevent exception in case of slash in the end ("localhost:80/). serverUrl should be contained without it"
            serverUrl = serverUrl.replace(/\/$/, "");
        }

        const user: string = await window.showInputBox({
            value: defaultUsername || "",
            prompt: MessageConstants.PROVIDE_USERNAME + " ( URL: " + serverUrl + " )",
            placeHolder: "",
            password: false
        });
        if (!user) {
            Logger.logDebug("CommandHolder#signIn: abort after username inputBox");
            //It means that user clicked "Esc": abort the operation
            return;
        }

        const password = await window.showInputBox({
            prompt: MessageConstants.PROVIDE_PASSWORD + " ( username: " + user + " )",
            placeHolder: "",
            password: true
        });
        if (!password) {
            //It means that user clicked "Esc": abort the operation
            Logger.logDebug("CommandHolder#signIn: abort after password inputBox");
            return;
        }
        this._remoteLogin = new RemoteLogin(serverUrl);
        const loginInfo: string[] = VsCodeUtils.parseValueColonValue(await this._remoteLogin.authenticate(user, password));
        const sessionId = loginInfo[0];
        const userId = loginInfo[1];
        return new Credentials(serverUrl, user, password, userId, sessionId);
    }

    private async storeLastUserCredentials(credentials: Credentials): Promise<void> {
        if (!credentials) {
            return;
        }
        await this._extManager.settings.setLastUrl(credentials.serverURL);
        await this._extManager.settings.setLastUsername(credentials.user);
        try {
            const keytar = require("keytar");
            Logger.logDebug(`CommandHolder#storeLastUserCredentials: keytar is supported. Good job user.`);
            keytar.setPassword("teamcity", "serverurl", credentials.serverURL);
            keytar.setPassword("teamcity", "username", credentials.user);
            keytar.setPassword("teamcity", "password", credentials.password);
        } catch (err) {
            Logger.logError(`CommandHolder#storeLastUserCredentials: Unfortunately storing a password is not supported. The reason: ${VsCodeUtils.formatErrorMessage(err)}`);
        }
    }
}
