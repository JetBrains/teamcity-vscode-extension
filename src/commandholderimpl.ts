"use strict";

import {
    Disposable,
    extensions,
    MessageItem,
    OutputChannel,
    QuickDiffProvider,
    QuickPickItem,
    QuickPickOptions,
    scm,
    SourceControlInputBox,
    SourceControlResourceState,
    window,
    workspace,
    WorkspaceEdit
} from "vscode";
import {Logger} from "./bll/utils/logger";
import {XmlParser} from "./bll/utils/xmlparser";
import {VsCodeUtils} from "./bll/utils/vscodeutils";
import {RemoteLogin} from "./dal/remotelogin";
import {ProjectItem} from "./bll/entities/projectitem";
import {CheckInInfo} from "./bll/remoterun/checkininfo";
import {PatchSender} from "./bll/remoterun/patchsender";
import {MessageConstants} from "./bll/utils/MessageConstants";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";
import {Credentials} from "./bll/credentialsstore/credentials";
import {BuildConfigItem} from "./bll/entities/buildconfigitem";
import {RemoteBuildServer} from "./dal/remotebuildserver";
import {CvsSupportProvider} from "./dal/cvsprovider";
import {TeamCityStatusBarItem} from "./view/teamcitystatusbaritem";
import {CvsLocalResource} from "./bll/entities/cvslocalresource";
import {MessageManager} from "./view/messagemanager";
import {CvsSupportProviderFactory} from "./bll/remoterun/cvsproviderfactory";
import {DataProviderManager} from "./view/dataprovidermanager";
import {CommandHolder} from "./commandholder";
import {Settings} from "./bll/entities/settings";
import {inject, injectable} from "inversify";
import {TYPES} from "./bll/utils/constants";
import {TeamCityOutput} from "./view/teamcityoutput";

@injectable()
export class CommandHolderImpl implements CommandHolder {
    private _cvsProvider: CvsSupportProvider;
    private _remoteLogin: RemoteLogin;
    private _remoteBuildServer: RemoteBuildServer;
    private _credentialsStore: CredentialsStore;
    private _teamCityOutput: TeamCityOutput;
    private _patchSender: PatchSender;
    private _settings: Settings;

    constructor(@inject(TYPES.RemoteLogin) remoteLogin: RemoteLogin,
                @inject(TYPES.RemoteBuildServer) remoteBuildServer: RemoteBuildServer,
                @inject(TYPES.PatchSender) patchSender: PatchSender,
                @inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore) {
        this._remoteLogin = remoteLogin;
        this._remoteBuildServer = remoteBuildServer;
        this._patchSender = patchSender;
        this._credentialsStore = credentialsStore;
    }

    public init(settings: Settings, teamCityOutput: TeamCityOutput): void {
        this._settings = settings;
        this._teamCityOutput = teamCityOutput;
    }

    public async signIn(): Promise<boolean> {
        Logger.logInfo("CommandHolderImpl#signIn: starts");
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
                const loginInfo: string[] = VsCodeUtils.parseValueColonValue(await this._remoteLogin.authenticate(serverUrl, user, password));
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
            this._credentialsStore.setCredential(credentials);
            Logger.logInfo("CommandHolderImpl#signIn: success");
            if (this._settings.showSignInWelcome) {
                this.showWelcomeMessage();
            }
            this._teamCityOutput.appendLine(MessageConstants.WELCOME_MESSAGE);
            this.storeLastUserCredentials(credentials);
            TeamCityStatusBarItem.setLoggedIn(credentials.serverURL, credentials.user);
        } else {
            Logger.logWarning("CommandHolderImpl#signIn: failed");
        }
        return signedIn;
    }

    public async selectFilesForRemoteRun() {
        Logger.logInfo("CommandHolderImpl#selectFilesForRemoteRun: starts");
        this._cvsProvider = await this.getCvsSupportProvider();
        const checkInInfo: CheckInInfo = await this._cvsProvider.getRequiredCheckInInfo();
        DataProviderManager.setExplorerContent(checkInInfo.cvsLocalResources);
        DataProviderManager.refresh();
    }

    public async getSuitableConfigs() {
        Logger.logInfo("CommandHolderImpl#getSuitableConfigs: starts");
        const credentials: Credentials = await this.tryGetCredentials();
        if (credentials === undefined) {
            //If there are no credentials, log already contains message about the problem
            return;
        }
        // const apiProvider: TCApiProvider = new TCXmlRpcApiProvider();
        const selectedResources: CvsLocalResource[] = DataProviderManager.getInclResources();
        if (selectedResources && selectedResources.length > 0) {
            this._cvsProvider.setFilesForRemoteRun(selectedResources);
        } else {
            this._cvsProvider = await this.getCvsSupportProvider();
        }

        if (this._cvsProvider === undefined) {
            //If there is no provider, log already contains message about the problem
            return;
        }
        const tcFormattedFilePaths: string[] = await this._cvsProvider.getFormattedFileNames();

        /* get suitable build configs hierarchically */
        const shortBuildConfigNames: string[] = await this._remoteBuildServer.getSuitableConfigurations(tcFormattedFilePaths);
        const buildXmlArray: string[] = await this._remoteBuildServer.getRelatedBuilds(shortBuildConfigNames);
        const projects: ProjectItem[] = await XmlParser.parseBuilds(buildXmlArray);
        DataProviderManager.setExplorerContent(projects);
        DataProviderManager.refresh();
        MessageManager.showInfoMessage(MessageConstants.PLEASE_SPECIFY_BUILDS);
        Logger.logInfo("CommandHolderImpl#getSuitableConfigs: finished");
    }

    public async remoteRunWithChosenConfigs() {
        Logger.logInfo("CommandHolderImpl#remoteRunWithChosenConfigs: starts");
        if (!this._cvsProvider) {
            Logger.logError("CommandHolderImpl#remoteRunWithChosenConfigs: cvsProvider absents. Please execute " +
                "`Find Suitable Build Configuration` command first");
            MessageManager.showWarningMessage("Please execute `Find Suitable Build Configuration` command first!");
            return;
        }
        const credentials: Credentials = await this.tryGetCredentials();
        if (!credentials) {
            Logger.logWarning("CommandHolderImpl#remoteRunWithChosenConfigs: credentials absent. Try to sign in again");
            return;
        }
        const includedBuildConfigs: BuildConfigItem[] = DataProviderManager.getIncludedBuildConfigs();
        if (includedBuildConfigs === undefined || includedBuildConfigs.length === 0) {
            MessageManager.showErrorMessage(MessageConstants.NO_CONFIGS_RUN_REMOTERUN);
            Logger.logWarning("CommandHolderImpl#remoteRunWithChosenConfigs: no selected build configs. Try to execute the 'GitRemote run' command");
            return;
        }
        DataProviderManager.setExplorerContent([]);
        DataProviderManager.refresh();
        const remoteRunResult: boolean = await this._patchSender.remoteRun(includedBuildConfigs, this._cvsProvider);
        if (remoteRunResult) {
            Logger.logInfo("CommandHolderImpl#remoteRunWithChosenConfigs: remote run is ok");
            try {
                await this._cvsProvider.requestForPostCommit();
            } catch (err) {
                throw err;
            }
        } else {
            Logger.logWarning("CommandHolderImpl#remoteRunWithChosenConfigs: something went wrong during remote run");
        }
        Logger.logInfo("CommandHolderImpl#remoteRunWithChosenConfigs: finishes");
    }

    public showOutput(): void {
        this._teamCityOutput.show();
    }

    private getDefaultURL(): string {
        return this._settings.getLastUrl();
    }

    private getDefaultUsername(): string {
        return this._settings.getLastUsername();
    }

    private async tryGetCredentials(): Promise<Credentials> {
        let credentials: Credentials = this._credentialsStore.getCredential();
        if (!credentials) {
            Logger.logInfo("CommandHolderImpl#tryGetCredentials: credentials is undefined. An attempt to get them");
            await this.signIn();
            credentials = this._credentialsStore.getCredential();
            if (!credentials) {
                MessageManager.showErrorMessage(MessageConstants.NO_CREDENTIALS_RUN_SIGNIN);
                Logger.logWarning("CommandHolderImpl#tryGetCredentials: An attempt to get credentials failed");
                return undefined;
            }
        }
        Logger.logInfo("CommandHolderImpl#tryGetCredentials: success");
        return credentials;
    }

    private async showWelcomeMessage() {

        const dontShowAgainItem: MessageItem = {title: MessageConstants.DO_NOT_SHOW_AGAIN};
        const chosenItem: MessageItem = await MessageManager.showInfoMessage(MessageConstants.WELCOME_MESSAGE, dontShowAgainItem);
        if (chosenItem && chosenItem.title === dontShowAgainItem.title) {
            this._settings.setShowSignInWelcome(false);
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
            Logger.logDebug("CommandHolderImpl#signIn: abort after serverUrl inputBox");
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
            Logger.logDebug("CommandHolderImpl#signIn: abort after username inputBox");
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
            Logger.logDebug("CommandHolderImpl#signIn: abort after password inputBox");
            return;
        }
        let authenticationResponse: string;
        try {
            authenticationResponse = await this._remoteLogin.authenticate(serverUrl, user, password);
        } catch (err) {
            throw Error(MessageConstants.STATUS_CODE_401);
        }
        const loginInfo: string[] = VsCodeUtils.parseValueColonValue(authenticationResponse);
        const sessionId = loginInfo[0];
        const userId = loginInfo[1];
        return new Credentials(serverUrl, user, password, userId, sessionId);
    }

    private async storeLastUserCredentials(credentials: Credentials): Promise<void> {
        if (!credentials) {
            return;
        }
        await this._settings.setLastUrl(credentials.serverURL);
        await this._settings.setLastUsername(credentials.user);
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

    private async getCvsSupportProvider(): Promise<CvsSupportProvider> {
        const cvsProviders: CvsSupportProvider[] = await CvsSupportProviderFactory.getCvsSupportProviders();
        if (!cvsProviders || cvsProviders.length === 0) {
            //If there is no provider, log already contains message about the problem
            Logger.logInfo("No one cvs was found");
            return Promise.reject<CvsSupportProvider>(undefined);
        } else if (cvsProviders.length === 1) {
            Logger.logInfo(`${cvsProviders[0].cvsType.toString()} cvsProvider was found`);
            return cvsProviders[0];
        } else if (cvsProviders.length > 1) {
            const choices: QuickPickItem[] = [];
            cvsProviders.forEach((cvsProvider) => {
                Logger.logInfo(`Several cvsProviders were found:`);
                choices.push({label: cvsProvider.cvsType.toString(), description: cvsProvider.cvsType.toString()});
                Logger.logInfo(`${cvsProvider.cvsType.toString()} cvsProvider was found`);
            });
            const SEVERAL_CVS_DETECTED = "Several CSV were detected. Please specify which should be selected.";
            const options: QuickPickOptions = {
                ignoreFocusOut: true,
                matchOnDescription: false,
                placeHolder: SEVERAL_CVS_DETECTED
            };
            const selectedCvs: QuickPickItem = await window.showQuickPick(choices, options);
            if (!selectedCvs) {
                Logger.logWarning(`Cvs Provider was not specified!`);
                throw new Error("Cvs Provider was not specified!");
            } else {
                cvsProviders.forEach((cvsProvider) => {
                    if (cvsProvider.cvsType.toString() === selectedCvs.label) {
                        Logger.logInfo(`${cvsProvider.cvsType.toString()} cvsProvider was selected`);
                        return cvsProvider;
                    }
                });
            }
            Logger.logWarning(`Cvs Provider is not determined. It should have not happen.`);
        }
    }
}
