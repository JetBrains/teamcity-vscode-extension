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
import {CheckInInfo} from "./bll/remoterun/checkininfo";
import {PatchSender} from "./bll/remoterun/patchsender";
import {MessageConstants} from "./bll/utils/MessageConstants";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";
import {Credentials} from "./bll/credentialsstore/credentials";
import {BuildConfigItem} from "./bll/entities/buildconfigitem";
import {RemoteBuildServer} from "./dal/remotebuildserver";
import {CvsSupportProvider} from "./dal/cvsprovider";
import {TeamCityStatusBarItem} from "./view/teamcitystatusbaritem";
import {MessageManager} from "./view/messagemanager";
import {CvsSupportProviderFactory} from "./bll/remoterun/cvsproviderfactory";
import {DataProviderManager} from "./view/dataprovidermanager";
import {CommandHolder} from "./commandholder";
import {Settings} from "./bll/entities/settings";
import {inject, injectable} from "inversify";
import {TYPES} from "./bll/utils/constants";
import {Output} from "./view/output";
import {GetSuitableConfigs} from "./bll/commands/getsuitableconfigs";
import {SelectFilesForRemoteRun} from "./bll/commands/selectfilesforremoterun";

@injectable()
export class CommandHolderImpl implements CommandHolder {
    private remoteLogin: RemoteLogin;
    private remoteBuildServer: RemoteBuildServer;
    private credentialsStore: CredentialsStore;
    private output: Output;
    private patchSender: PatchSender;
    private settings: Settings;
    private xmlParser: XmlParser;
    private cvsSupportProviderFactory: CvsSupportProviderFactory;

    constructor(@inject(TYPES.RemoteLogin) remoteLogin: RemoteLogin,
                @inject(TYPES.RemoteBuildServer) remoteBuildServer: RemoteBuildServer,
                @inject(TYPES.PatchSender) patchSender: PatchSender,
                @inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore,
                @inject(TYPES.Output) output: Output,
                @inject(TYPES.Settings) settings: Settings,
                @inject(TYPES.XmlParser) xmlParser: XmlParser,
                @inject(TYPES.CvsProviderFactory) cvsSupportProviderFactory: CvsSupportProviderFactory) {
        this.remoteLogin = remoteLogin;
        this.remoteBuildServer = remoteBuildServer;
        this.patchSender = patchSender;
        this.credentialsStore = credentialsStore;
        this.output = output;
        this.settings = settings;
        this.xmlParser = xmlParser;
        this.cvsSupportProviderFactory = cvsSupportProviderFactory;
    }

    public async signIn(): Promise<boolean> {
        Logger.logInfo("CommandHolderImpl#signIn: starts");
        let signedIn: boolean = false;
        let credentials: Credentials;
        //try getting credentials from keytar
        try {
            const keytar = require("keytar");
            Logger.logDebug(`CommandHolder#signIn: keytar is supported. Credentials will be stored.`);
            const serverUrl = await keytar.getPassword("teamcity", "serverurl");
            const user = await keytar.getPassword("teamcity", "username");
            const password = await keytar.getPassword("teamcity", "password");
            if (serverUrl && user && password) {
                const loginInfo: string[] = VsCodeUtils.parseValueColonValue(await this.remoteLogin.authenticate(serverUrl, user, password));
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
            this.credentialsStore.setCredential(credentials);
            Logger.logInfo("CommandHolderImpl#signIn: success");
            if (this.settings.showSignInWelcome) {
                this.showWelcomeMessage();
            }
            this.output.appendLine(MessageConstants.WELCOME_MESSAGE);
            this.storeLastUserCredentials(credentials);
            TeamCityStatusBarItem.setLoggedIn(credentials.serverURL, credentials.user);
        } else {
            Logger.logWarning("CommandHolderImpl#signIn: failed");
        }
        return signedIn;
    }

    public async selectFilesForRemoteRun() {
        Logger.logInfo("CommandHolderImpl#selectFilesForRemoteRun: starts");
        const cvsProvider = await this.getCvsSupportProvider();
        const selectFilesForRemoteRun: Command = new SelectFilesForRemoteRun(cvsProvider);
        selectFilesForRemoteRun.exec();
    }

    public async getSuitableConfigs(): Promise<void> {
        const cvsProvider = await this.getCvsSupportProvider();
        const credentials: Credentials = await this.tryGetCredentials();
        if (credentials === undefined) {
            //If there are no credentials, log already contains message about the problem
            return;
        }
        const getSuitableConfigs: Command = new GetSuitableConfigs(cvsProvider, this.remoteBuildServer, this.xmlParser);
        return getSuitableConfigs.exec();
    }

    public async remoteRunWithChosenConfigs() {
        Logger.logInfo("CommandHolderImpl#remoteRunWithChosenConfigs: starts");
        const credentials: Credentials = await this.tryGetCredentials();
        if (!credentials) {
            Logger.logWarning("CommandHolderImpl#remoteRunWithChosenConfigs: credentials absent. Try to sign in again");
            return;
        }
        const includedBuildConfigs: BuildConfigItem[] = DataProviderManager.getIncludedBuildConfigs();
        const checkInInfo: CheckInInfo = DataProviderManager.getCheckInInfoWithIncludedResources();
        if (includedBuildConfigs === undefined || includedBuildConfigs.length === 0) {
            MessageManager.showErrorMessage(MessageConstants.NO_CONFIGS_RUN_REMOTERUN);
            Logger.logWarning("CommandHolderImpl#remoteRunWithChosenConfigs: no selected build configs. Try to execute the 'GitRemote run' command");
            return;
        }
        DataProviderManager.resetExplorerContentAndRefresh();
        const cvsProvider = await this.getCvsSupportProvider();
        const remoteRunResult: boolean = await this.patchSender.remoteRun(includedBuildConfigs, cvsProvider);
        if (remoteRunResult) {
            Logger.logInfo("CommandHolderImpl#remoteRunWithChosenConfigs: remote run is ok");
            try {
                await cvsProvider.requestForPostCommit(checkInInfo);
            } catch (err) {
                throw err;
            }
        } else {
            Logger.logWarning("CommandHolderImpl#remoteRunWithChosenConfigs: something went wrong during remote run");
        }
        Logger.logInfo("CommandHolderImpl#remoteRunWithChosenConfigs: finishes");
    }

    public showOutput(): void {
        this.output.show();
    }

    private getDefaultURL(): string {
        return this.settings.getLastUrl();
    }

    private getDefaultUsername(): string {
        return this.settings.getLastUsername();
    }

    private async tryGetCredentials(): Promise<Credentials> {
        let credentials: Credentials = this.credentialsStore.getCredential();
        if (!credentials) {
            Logger.logInfo("CommandHolderImpl#tryGetCredentials: credentials is undefined. An attempt to get them");
            await this.signIn();
            credentials = this.credentialsStore.getCredential();
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
            this.settings.setShowSignInWelcome(false);
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
            authenticationResponse = await this.remoteLogin.authenticate(serverUrl, user, password);
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
        await this.settings.setLastUrl(credentials.serverURL);
        await this.settings.setLastUsername(credentials.user);
        try {
            const keytar = require("keytar");
            Logger.logDebug(`CommandHolder#storeLastUserCredentials: keytar is supported. Credentials will be stored.`);
            keytar.setPassword("teamcity", "serverurl", credentials.serverURL);
            keytar.setPassword("teamcity", "username", credentials.user);
            keytar.setPassword("teamcity", "password", credentials.password);
        } catch (err) {
            Logger.logError(`CommandHolder#storeLastUserCredentials: Unfortunately storing a password is not supported. The reason: ${VsCodeUtils.formatErrorMessage(err)}`);
        }
    }

    private async getCvsSupportProvider(): Promise<CvsSupportProvider> {
        const cvsProviders: CvsSupportProvider[] = await this.cvsSupportProviderFactory.getCvsSupportProviders();
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
                for (let i = 0; i < cvsProviders.length; i++) {
                    const cvsProvider = cvsProviders[i];
                    if (cvsProvider.cvsType.toString() === selectedCvs.label) {
                        Logger.logInfo(`${cvsProvider.cvsType.toString()} cvsProvider was selected`);
                        return Promise.resolve<CvsSupportProvider>(cvsProvider);
                    }
                }
                throw new Error("Cvs Provider was not specified!");
            }
        }
    }
}
