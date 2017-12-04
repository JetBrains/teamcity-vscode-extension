"use strict";

import {Logger} from "../utils/logger";
import {Credentials} from "../credentialsstore/credentials";
import {VsCodeUtils} from "../utils/vscodeutils";
import {MessageConstants} from "../utils/messageconstants";
import {TeamCityStatusBarItem} from "../../view/teamcitystatusbaritem";
import {MessageItem, window, commands} from "vscode";
import {MessageManager} from "../../view/messagemanager";
import {RemoteLogin} from "../../dal/remotelogin";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {Settings} from "../entities/settings";
import {Output} from "../../view/output";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";

@injectable()
export class SignIn implements Command {

    private remoteLogin: RemoteLogin;
    private credentialsStore: CredentialsStore;
    private settings: Settings;
    private output: Output;

    public constructor(@inject(TYPES.RemoteLogin) remoteLogin: RemoteLogin,
                       @inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore,
                       @inject(TYPES.Output) output: Output,
                       @inject(TYPES.Settings) settings: Settings) {
        this.remoteLogin = remoteLogin;
        this.credentialsStore = credentialsStore;
        this.output = output;
        this.settings = settings;
    }

    public async exec(): Promise<void> {
        Logger.logInfo("SignIn#exec: starts.");
        let credentials: Credentials = await this.tryGetCredentialsFromKeytar();
        credentials = credentials || await this.requestTypingCredentials();
        if (credentials) {
            this.credentialsStore.setCredentials(credentials);
            this.storeLastUserCredentials(credentials);
            Logger.logInfo("SignIn#exec: success.");
            this.greetUser(credentials);
        } else {
            Logger.logWarning("SignIn#exec: operation was aborted by user");
        }
    }

    private async tryGetCredentialsFromKeytar(): Promise<Credentials> {
        let credentials: Credentials = undefined;
        try {
            credentials = await this.getCredentialsFromKeytar();
        } catch (err) {
            Logger.logInfo(`SignIn#tryGetCredentialsFromKeytar: keytar doesn't contains a valid credentials`);
        }
        return Promise.resolve<Credentials>(credentials);
    }

    private async getCredentialsFromKeytar(): Promise<Credentials> {
        const keytar = this.tryGetKeyTarModule();
        Logger.logDebug(`SignIn#getCredentialsFromKeytar: keytar is supported. Credentials will be stored.`);
        const serverUrl = await keytar.getPassword("teamcity", "serverurl");
        const user = await keytar.getPassword("teamcity", "username");
        const password = await keytar.getPassword("teamcity", "password");
        return this.validateAndGenerateUserCredentials(serverUrl, user, password);
    }

    private tryGetKeyTarModule(): any {
        let keytar: any;
        try {
            keytar = require("keytar");
        } catch (err) {
            throw Error("Keytar is unsupported");
        }
        return keytar;
    }

    private async validateAndGenerateUserCredentials(serverUrl: string, user: string, password: string): Promise<Credentials> {
        if (serverUrl && user && password) {
            Logger.logDebug(`SignIn#validateAndGenerateUserCredentials: credentials are not undefined and should be validated`);
            const unParsedColonValues: string = await this.remoteLogin.authenticate(serverUrl, user, password);
            const loginInfo: string[] = VsCodeUtils.parseValueColonValue(unParsedColonValues);
            const authenticationSuccessful = !!loginInfo;
            if (authenticationSuccessful) {
                const sessionId = loginInfo[0];
                const userId = loginInfo[1];
                return Promise.resolve<Credentials>(new Credentials(serverUrl, user, password, userId, sessionId));
            }
            Logger.logDebug(`SignIn#validateAndGenerateUserCredentials: credentials were not passed an authentication check.`);
            return Promise.reject(MessageConstants.STATUS_CODE_401);
        }
        Logger.logDebug(`SignIn#validateAndGenerateUserCredentials: credentials are undefined.`);
        return Promise.reject("Credentials are undefined.");
    }

    private async requestTypingCredentials(): Promise<Credentials> {
        const defaultURL: string = this.settings.getLastUrl();
        const defaultUsername: string = this.settings.getLastUsername();
        let serverUrl: string;
        let username: string;
        let password: string;
        try {
            serverUrl = await this.requestServerUrl(defaultURL);
            username = await this.requestUsername(defaultUsername, serverUrl);
            password = await this.requestPassword(username);
        } catch (err) {
            return Promise.resolve(undefined);
        }
        return this.validateAndGenerateUserCredentials(serverUrl, username, password);
    }

    private async requestServerUrl(defaultURL: string): Promise<string> {
        let serverUrl: string = await window.showInputBox({
            value: defaultURL || "",
            prompt: MessageConstants.PROVIDE_URL,
            placeHolder: "",
            password: false
        });
        const operationWasNotAborted: boolean = !!serverUrl;
        if (operationWasNotAborted) {
            serverUrl = this.removeSlashInTheEndIfExists(serverUrl);
            return Promise.resolve<string>(serverUrl);
        } else {
            return Promise.reject("Server URL was not specified.");
        }
    }

    private removeSlashInTheEndIfExists(serverUrl: string): string {
        return serverUrl.replace(/\/$/, "");
    }

    private async requestUsername(defaultUsername: string, serverUrl: string): Promise<string> {
        const userName: string = await window.showInputBox({
            value: defaultUsername || "",
            prompt: MessageConstants.PROVIDE_USERNAME + " ( URL: " + serverUrl + " )",
            placeHolder: "",
            password: false
        });
        const operationWasNotAborted: boolean = !!userName;
        if (operationWasNotAborted) {
            return Promise.resolve<string>(userName);
        } else {
            return Promise.reject("Username was not specified.");
        }
    }

    private async requestPassword(username: string): Promise<string> {
        const password: string = await window.showInputBox({
            prompt: MessageConstants.PROVIDE_PASSWORD + " ( username: " + username + " )",
            placeHolder: "",
            password: true
        });
        const operationWasNotAborted: boolean = !!password;
        if (operationWasNotAborted) {
            return Promise.resolve<string>(password);
        } else {
            return Promise.reject("Password was not specified.");
        }
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

    private async greetUser(credentials: Credentials): Promise<void> {
        this.output.appendLine(MessageConstants.WELCOME_MESSAGE);
        TeamCityStatusBarItem.setLoggedIn(credentials.serverURL, credentials.user);
        if (this.settings.showSignInWelcome) {
            await this.showWelcomeMessage();
        }
    }

    private async showWelcomeMessage(): Promise<void> {
        const doNotShowAgainItem: MessageItem = {title: MessageConstants.DO_NOT_SHOW_AGAIN};
        const chosenItem: MessageItem = await MessageManager.showInfoMessage(MessageConstants.WELCOME_MESSAGE, doNotShowAgainItem);
        if (chosenItem && chosenItem.title === doNotShowAgainItem.title) {
            await this.settings.setShowSignInWelcome(false);
        }
    }

}
