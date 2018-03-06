import {Logger} from "../utils/logger";
import {Credentials} from "../credentialsstore/credentials";
import {MessageConstants} from "../utils/messageconstants";
import {TeamCityStatusBarItem} from "../../view/teamcitystatusbaritem";
import {MessageItem, window} from "vscode";
import {MessageManager} from "../../view/messagemanager";
import {RemoteLogin} from "../../dal/remotelogin";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {Settings} from "../entities/settings";
import {Output} from "../../view/output";
import {inject, injectable} from "inversify";
import {Constants, TYPES} from "../utils/constants";
import {PersistentStorageManager} from "../credentialsstore/persistentstoragemanager";
import {Utils} from "../utils/utils";

@injectable()
export class SignIn implements Command {

    private remoteLogin: RemoteLogin;
    private credentialsStore: CredentialsStore;
    private settings: Settings;
    private output: Output;
    private persistentStorageManager: PersistentStorageManager;
    private statusBarItem: TeamCityStatusBarItem;

    public constructor(@inject(TYPES.RemoteLogin) remoteLogin: RemoteLogin,
                       @inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore,
                       @inject(TYPES.Output) output: Output,
                       @inject(TYPES.Settings) settings: Settings,
                       @inject(TYPES.PersistentStorageManager) persistentStorageManager: PersistentStorageManager,
                       @inject(TYPES.TeamCityStatusBarItem) statusBarItem: TeamCityStatusBarItem) {
        this.remoteLogin = remoteLogin;
        this.credentialsStore = credentialsStore;
        this.output = output;
        this.settings = settings;
        this.persistentStorageManager = persistentStorageManager;
        this.statusBarItem = statusBarItem;
    }

    public async exec(args: any[] = undefined): Promise<void> {
        Logger.logInfo("SignIn#exec: starts.");
        const silent: boolean = args && args[0];
        const fromPersistence: Credentials = await this.tryGetCredentialsFromPersistence();
        if (silent) {
            return this.execSilent(fromPersistence);
        }
        const typedCredentials: Credentials = await this.requestTypingCredentials(fromPersistence);

        if (typedCredentials) {
            this.credentialsStore.setCredentials(typedCredentials);
            Logger.logInfo("SignIn#exec: success.");
            if (!fromPersistence) {
                await this.suggestToStoreCredentials(typedCredentials);
            } else if (!typedCredentials.equals(fromPersistence)) {
                await this.suggestToUpdateCredentials(typedCredentials);
            }
            return this.greetUser(typedCredentials);
        } else {
            Logger.logWarning("SignIn#exec: operation was aborted by user");
        }
    }

    private async execSilent(fromPersistence: Credentials): Promise<void> {
        if (!fromPersistence) {
            return;
        }
        this.credentialsStore.setCredentials(fromPersistence);
        Logger.logInfo("SignIn#exec: success.");
        return this.greetUser(fromPersistence);
    }

    private async tryGetCredentialsFromPersistence(): Promise<Credentials> {
        let credentials: Credentials;
        try {
            credentials = await this.getCredentialsFromPersistence();
        } catch (err) {
            Logger.logWarning(`[SignIn::tryGetCredentialsFromPersistence] failed to get credentials from persistence ` +
                `with error: ${Utils.formatErrorMessage(err)}`);
        }
        return credentials;
    }

    private async getCredentialsFromPersistence(): Promise<Credentials> {
        const creds: Credentials = await this.persistentStorageManager.getCredentials();
        return creds ? this.validateAndGenerateUserCredentials(creds.serverURL, creds.user, creds.password) : undefined;
    }

    private async validateAndGenerateUserCredentials(serverUrl: string, user: string, password: string): Promise<Credentials> {
        if (serverUrl && user && password) {
            Logger.logDebug(`SignIn#validateAndGenerateUserCredentials: credentials are not undefined and should be validated`);
            const unParsedColonValues: string = await this.remoteLogin.authenticate(serverUrl, user, password);
            const loginInfo: string[] = Utils.parseValueColonValue(unParsedColonValues);
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

    private async requestTypingCredentials(fromPersistence: Credentials): Promise<Credentials> {
        let serverUrl: string;
        let username: string;
        let password: string;
        const suggestedUrl = fromPersistence ? fromPersistence.serverURL : Constants.DEFAULT_URL;
        const suggestedUsername = fromPersistence ? fromPersistence.user : "";
        try {
            serverUrl = await this.requestServerUrl(suggestedUrl);
            username = await SignIn.requestUsername(suggestedUsername, serverUrl);
            password = await SignIn.requestPassword(username);
        } catch (err) {
            return Promise.resolve(undefined);
        }
        return this.validateAndGenerateUserCredentials(serverUrl, username, password);
    }

    private static async requestMandatoryFiled(defaultValue: string = "",
                                               basicPrompt: string = "",
                                               isPassword: boolean): Promise<string> {
        let operationWasAborted: boolean = false;
        let fieldWasFilled: boolean = false;
        let fieldValue: string;
        let prompt = basicPrompt;
        const placeHolder = MessageConstants.MANDATORY_FIELD;
        while (!fieldWasFilled && !operationWasAborted) {
            fieldValue = await window.showInputBox({
                value: defaultValue,
                prompt: prompt,
                placeHolder: placeHolder,
                password: isPassword,
                ignoreFocusOut: true
            });
            operationWasAborted = fieldValue === undefined;
            fieldWasFilled = fieldValue !== "";
            prompt = `${MessageConstants.MANDATORY_FIELD} ${basicPrompt}`;
        }

        if (!operationWasAborted) {
            return Promise.resolve<string>(fieldValue);
        } else {
            return Promise.reject(`Mandatory Value was not specified. basicPrompt: ${basicPrompt}`);
        }
    }

    private async requestServerUrl(defaultURL: string): Promise<string> {
        let messageToDisplay: string = MessageConstants.PROVIDE_URL;
        while (true) {
            let serverUrl: string = await SignIn.requestMandatoryFiled(defaultURL, messageToDisplay, false);
            serverUrl = SignIn.removeSlashInTheEndIfExists(serverUrl);
            if (await this.remoteLogin.isServerReachable(serverUrl)) {
                return serverUrl;
            }
            defaultURL = serverUrl;
            messageToDisplay = `${MessageConstants.URL_NOT_REACHABLE} ${MessageConstants.PROVIDE_URL}`;
        }
    }

    private static removeSlashInTheEndIfExists(serverUrl: string): string {
        return serverUrl.replace(/\/$/, "");
    }

    private static async requestUsername(defaultUsername: string, serverUrl: string): Promise<string> {
        const defaultPrompt = `${MessageConstants.PROVIDE_USERNAME} ( URL: ${serverUrl} )`;
        return SignIn.requestMandatoryFiled(defaultUsername, defaultPrompt, false);
    }

    private static async requestPassword(username: string): Promise<string> {
        const defaultPrompt = `${MessageConstants.PROVIDE_PASSWORD} ( username: ${username} )`;
        return SignIn.requestMandatoryFiled("", defaultPrompt, true);
    }

    private async storeLastUserCredentials(credentials: Credentials): Promise<void> {
        if (!credentials) {
            return;
        }
        try {
            await this.persistentStorageManager.setCredentials(credentials);
        } catch (err) {
            Logger.logError(`SignIn#storeLastUserCredentials: Unfortunately storing a password is not supported. The reason: ${Utils.formatErrorMessage(err)}`);
        }
    }

    private async greetUser(credentials: Credentials): Promise<void> {
        this.output.appendLine(MessageConstants.WELCOME_MESSAGE);
        this.statusBarItem.setLoggedIn(credentials.serverURL, credentials.user);
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

    private async suggestToStoreCredentials(credentials: Credentials): Promise<void> {
        if (!this.settings.shouldAskStoreCredentials()) {
            return;
        }

        const storeCredentialsItem: MessageItem = {title: "Yes"};
        const notStoreCredentialsItem: MessageItem = {title: "No"};
        const doNotShowAgainItem: MessageItem = {title: MessageConstants.DO_NOT_ASK_AGAIN};
        const chosenItem: MessageItem = await MessageManager.showInfoMessage(
            MessageConstants.SAVE_CREDENTIALS_SUGGESTION, storeCredentialsItem, notStoreCredentialsItem, doNotShowAgainItem);
        if (chosenItem && chosenItem.title === storeCredentialsItem.title) {
            await this.storeLastUserCredentials(credentials);
        } else if (chosenItem && chosenItem.title === doNotShowAgainItem.title) {
            await this.settings.setShowStoreCredentialsSuggestion(false);
            await this.persistentStorageManager.removeCredentials();
        } else {
            await this.persistentStorageManager.removeCredentials();
        }
    }

    private async suggestToUpdateCredentials(credentials: Credentials): Promise<void> {
        const updateCredentialsItem: MessageItem = {title: "Yes"};
        const doNothing: MessageItem = {title: "No"};
        const chosenItem: MessageItem = await MessageManager.showInfoMessage(
            MessageConstants.UPDATE_CREDENTIALS_SUGGESTION, updateCredentialsItem, doNothing);
        if (chosenItem && chosenItem.title === updateCredentialsItem.title) {
            await this.storeLastUserCredentials(credentials);
        }
    }
}
