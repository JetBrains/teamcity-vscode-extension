"use strict";
import {Logger} from "../utils/logger";
import {Credentials} from "../credentialsstore/credentials";
import {VsCodeUtils} from "../utils/vscodeutils";
import {MessageConstants} from "../utils/messageconstants";
import {TeamCityStatusBarItem} from "../../view/teamcitystatusbaritem";
import {
    window, MessageItem
} from "vscode";
import {MessageManager} from "../../view/messagemanager";
import {RemoteLogin} from "../../dal/remotelogin";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {Settings} from "../entities/settings";
import {Output} from "../../view/output";

export class SignIn implements Command {

    private remoteLogin: RemoteLogin;
    private credentialsStore: CredentialsStore;
    private settings: Settings;
    private output: Output;
    public constructor(remoteLogin: RemoteLogin, credentialsStore: CredentialsStore, settings: Settings, output: Output ) {
        this.remoteLogin = remoteLogin;
        this.credentialsStore = credentialsStore;
        this.settings = settings;
        this.output = output;
    }

    public async exec(): Promise<void> {
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
       // return signedIn;
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

    private async showWelcomeMessage() {
        const dontShowAgainItem: MessageItem = {title: MessageConstants.DO_NOT_SHOW_AGAIN};
        const chosenItem: MessageItem = await MessageManager.showInfoMessage(MessageConstants.WELCOME_MESSAGE, dontShowAgainItem);
        if (chosenItem && chosenItem.title === dontShowAgainItem.title) {
            this.settings.setShowSignInWelcome(false);
        }
    }

    private getDefaultURL(): string {
        return this.settings.getLastUrl();
    }

    private getDefaultUsername(): string {
        return this.settings.getLastUsername();
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
}
