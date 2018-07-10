import {Logger} from "../utils/logger";
import {Credentials} from "../credentialsstore/credentials";
import {MessageConstants} from "../utils/messageconstants";
import {TeamCityStatusBarItem} from "../../view/teamcitystatusbaritem";
import {MessageItem} from "vscode";
import {MessageManager} from "../../view/messagemanager";
import {RemoteLogin} from "../../dal/remotelogin";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {Settings} from "../entities/settings";
import {Output} from "../../view/output";
import {inject, injectable} from "inversify";
import {Constants, TYPES} from "../utils/constants";
import {PersistentStorageManager} from "../credentialsstore/persistentstoragemanager";
import {Utils} from "../utils/utils";
import {VsCodeUtils} from "../utils/vscodeutils";
import {WindowProxy} from "../moduleproxies/window-proxy";
import {Context} from "../../view/Context";

@injectable()
export class SignIn implements Command {

    public constructor(@inject(TYPES.RemoteLogin) private readonly remoteLogin: RemoteLogin,
                       @inject(TYPES.CredentialsStore) private readonly credentialsStore: CredentialsStore,
                       @inject(TYPES.Settings) private readonly settings: Settings,
                       @inject(TYPES.PersistentStorageManager)
                       private readonly persistentStorageManager: PersistentStorageManager,
                       @inject(TYPES.TeamCityStatusBarItem) private readonly statusBarItem: TeamCityStatusBarItem,
                       @inject(TYPES.MessageManager) private readonly messageManager: MessageManager,
                       @inject(TYPES.WindowProxy) private readonly windowProxy: WindowProxy,
                       @inject(TYPES.Context) private readonly myContext: Context) {
        //
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
            this.saveTargetNameToSettings(typedCredentials);
            Logger.logInfo("SignIn#exec: success.");
            if (!fromPersistence) {
                this.suggestToStoreCredentials(typedCredentials);
            } else if (!typedCredentials.equals(fromPersistence)) {
                this.suggestToUpdateCredentials(typedCredentials);
            }
            this.myContext.setSignIn(true);
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
        this.myContext.setSignIn(true);
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
        return creds ? this.validateAndGenerateUserCredentials(creds.serverURL, creds.user, creds.password, true) : undefined;
    }

    private async validateAndGenerateUserCredentials(serverUrl: string,
                                                     user: string,
                                                     password: string,
                                                     silent: boolean = false): Promise<Credentials> {
        if (!(serverUrl && user && password)) {
            Logger.logDebug(`SignIn#validateAndGenerateUserCredentials: credentials are undefined.`);
            return Promise.reject("Credentials are undefined.");
        }

        const promise: Promise<Credentials> = new Promise<Credentials>((resolve, reject) => {
            Logger.logDebug(`SignIn#validateAndGenerateUserCredentials: credentials are not undefined and should be validated`);
            this.remoteLogin.authenticate(serverUrl, user, password).then((unParsedColonValues: string) => {
                const loginInfo: string[] = Utils.parseValueColonValue(unParsedColonValues);
                const authenticationSuccessful = !!loginInfo;
                if (authenticationSuccessful) {
                    const sessionId = loginInfo[0];
                    const userId = loginInfo[1];
                    resolve(new Credentials(serverUrl, user, password, userId, sessionId));
                } else {
                    Logger.logDebug(`SignIn#validateAndGenerateUserCredentials: credentials were not passed an authentication check.`);
                    reject(MessageConstants.STATUS_CODE_401);
                }
            }).catch((err) => {
                reject(err);
            });
        });
        if (!silent) {
            this.windowProxy.showWithProgress("Signing in to a TeamCity server", promise);
        }

        return promise;
    }

    private async requestTypingCredentials(fromPersistence: Credentials): Promise<Credentials> {
        let serverUrl: string;
        let username: string;
        let password: string;
        let suggestedUrl = Constants.DEFAULT_URL;
        let suggestedUsername = "";

        if (fromPersistence) {
            suggestedUrl = fromPersistence.serverURL;
            suggestedUsername = fromPersistence.user;
        } else {
            const targetNameSettings = this.settings.lastLogin;
            const targetName: { url, username } = Utils.tryParseTargetName(targetNameSettings);
            suggestedUrl = targetName ? targetName.url : suggestedUrl;
            suggestedUsername = targetName ? targetName.username : suggestedUsername;
        }

        try {
            serverUrl = await this.requestServerUrl(suggestedUrl);
            username = await SignIn.requestUsername(suggestedUsername, serverUrl);
            password = await SignIn.requestPassword(username);
        } catch (err) {
            return Promise.resolve(undefined);
        }
        return this.validateAndGenerateUserCredentials(serverUrl, username, password);
    }

    private async requestServerUrl(defaultURL: string): Promise<string> {
        let messageToDisplay: string = MessageConstants.PROVIDE_URL;
        while (true) {
            let serverUrl: string =
                await VsCodeUtils.requestMandatoryFiled(defaultURL, messageToDisplay, false);
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
        return VsCodeUtils.requestMandatoryFiled(defaultUsername, defaultPrompt, false);
    }

    private static async requestPassword(username: string): Promise<string> {
        const defaultPrompt = `${MessageConstants.PROVIDE_PASSWORD} ( username: ${username} )`;
        return VsCodeUtils.requestMandatoryFiled("", defaultPrompt, true);
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
        this.statusBarItem.setLoggedIn(credentials.serverURL, credentials.user);
    }

    private async suggestToStoreCredentials(credentials: Credentials): Promise<void> {
        if (!this.settings.shouldAskStoreCredentials()) {
            return;
        }

        const storeCredentialsItem: MessageItem = {title: "Yes"};
        const notStoreCredentialsItem: MessageItem = {title: "No"};
        const doNotShowAgainItem: MessageItem = {title: MessageConstants.DO_NOT_ASK_AGAIN};
        const chosenItem: MessageItem = await this.messageManager.showInfoMessage(
            MessageConstants.SAVE_CREDENTIALS_SUGGESTION, storeCredentialsItem, notStoreCredentialsItem, doNotShowAgainItem);
        if (chosenItem && chosenItem.title === storeCredentialsItem.title) {
            await this.storeLastUserCredentials(credentials);
        } else if (chosenItem && chosenItem.title === doNotShowAgainItem.title) {
            await this.settings.setShouldAskStoreCredentials(false);
            await this.persistentStorageManager.removeCredentials();
        } else {
            await this.persistentStorageManager.removeCredentials();
        }
    }

    private async suggestToUpdateCredentials(credentials: Credentials): Promise<void> {
        const updateCredentialsItem: MessageItem = {title: "Yes"};
        const doNothing: MessageItem = {title: "No"};
        const chosenItem: MessageItem = await this.messageManager.showInfoMessage(
            MessageConstants.UPDATE_CREDENTIALS_SUGGESTION, updateCredentialsItem, doNothing);
        if (chosenItem && chosenItem.title === updateCredentialsItem.title) {
            await this.storeLastUserCredentials(credentials);
        }
    }

    private saveTargetNameToSettings(credentials: Credentials): void {
        this.settings.lastLogin = Utils.createTargetName(credentials.serverURL, credentials.user);
    }
}
