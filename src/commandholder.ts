"use strict";

import {Logger} from "./utils/logger";
import {VsCodeUtils} from "./utils/vscodeutils";
import {ProjectItem} from "./entities/projectitem";
import {PatchSender} from "./interfaces/PatchSender";
import {ExtensionManager} from "./extensionmanager";
import {Credentials} from "./credentialsstore/credentials";
import {CvsSupportProvider} from "./interfaces/cvsprovider";
import {CvsSupportProviderFactory} from "./remoterun/cvsproviderfactory";
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
import {CheckInInfo} from "./interfaces/CheckinInfo";
import {TCApiProvider} from "./interfaces/TCApiProvider";
import {TCXmlRpcApiProvider} from "./teamcityapi/TCXmlRpcApiProvider";
import {CvsLocalResource} from "./entities/cvslocalresource";
import {BuildConfigItem} from "./entities/buildconfigitem";
import {CustomPatchSender} from "./remoterun/CustomPatchSender";
import {MessageConstants} from "./utils/MessageConstants";

export class CommandHolder {
    private _extManager: ExtensionManager;
    private _cvsProvider: CvsSupportProvider;

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
            const url = await keytar.getPassword("teamcity", "serverurl");
            const user = await keytar.getPassword("teamcity", "username");
            const pass = await keytar.getPassword("teamcity", "password");
            credentials = new Credentials(url, user, pass);
            signedIn = credentials ? await this._extManager.credentialStore.setCredential(credentials) : false;
            Logger.logDebug(`CommandHolder#signIn: password was${signedIn ? "" : " not"} found at keytar.`);
        } catch (err) {
            Logger.logError(`CommandHolder#signIn: Unfortunately storing a password is not supported. The reason: ${VsCodeUtils.formatErrorMessage(err)}`);
        }

        if (!signedIn) {
            credentials = await this.requestTypingCredentials();
            signedIn = credentials ? await this._extManager.credentialStore.setCredential(credentials) : false;
        }

        if (signedIn) {
            Logger.logInfo("CommandHolder#signIn: success");
            if (this._extManager.settings.showSignInWelcome) {
                this.showWelcomeMessage();
            }
            this.storeLastUserCredentials(credentials);
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
        const apiProvider: TCApiProvider = new TCXmlRpcApiProvider();
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
        const projects: ProjectItem[] = await apiProvider.getSuitableBuildConfigs(tcFormattedFilePaths, credentials);
        if (projects && projects.length > 0) {
            await this._extManager.settings.setEnableRemoteRun(true);
        }
        this._extManager.configurationExplorer.setExplorerContent(projects);
        this._extManager.configurationExplorer.refresh();
        VsCodeUtils.showInfoMessage("[TeamCity] Please specify builds for remote run.");
        Logger.logInfo("CommandHolder#getSuitableConfigs: finished");
    }

    public async remoteRunWithChosenConfigs() {
        Logger.logInfo("CommandHolder#remoteRunWithChosenConfigs: starts");
        const credentials: Credentials = await this.tryGetCredentials();
        if (!credentials || !this._cvsProvider) {
            //TODO: think about the message in this case
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
        const patchSender: PatchSender = new CustomPatchSender(credentials.serverURL);
        const remoteRunResult: boolean = await patchSender.remoteRun(credentials, includedBuildConfigs, this._cvsProvider);
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

        let url: string = await window.showInputBox({
            value: defaultURL || "",
            prompt: MessageConstants.PROVIDE_URL,
            placeHolder: "",
            password: false
        });
        if (!url) {
            //It means that user clicked "Esc": abort the operation
            Logger.logDebug("CommandHolder#signIn: abort after url inputBox");
            return;
        } else {
            //to prevent exception in case of slash in the end ("localhost:80/). url should be contained without it"
            url = url.replace(/\/$/, "");
        }

        const user: string = await window.showInputBox({
            value: defaultUsername || "",
            prompt: MessageConstants.PROVIDE_USERNAME + " ( URL: " + url + " )",
            placeHolder: "",
            password: false
        });
        if (!user) {
            Logger.logDebug("CommandHolder#signIn: abort after username inputBox");
            //It means that user clicked "Esc": abort the operation
            return;
        }

        const pass = await window.showInputBox({
            prompt: MessageConstants.PROVIDE_PASSWORD + " ( username: " + user + " )",
            placeHolder: "",
            password: true
        });
        if (!pass) {
            //It means that user clicked "Esc": abort the operation
            Logger.logDebug("CommandHolder#signIn: abort after password inputBox");
            return;
        }
        return new Credentials(url, user, pass);
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
            keytar.setPassword("teamcity", "password", credentials.pass);
        } catch (err) {
            Logger.logError(`CommandHolder#storeLastUserCredentials: Unfortunately storing a password is not supported. The reason: ${VsCodeUtils.formatErrorMessage(err)}`);
        }
    }
}
