import {inject, injectable} from "inversify";
import {Logger} from "../utils/logger";
import {Credentials} from "./credentials";
import {CredentialsStore} from "./credentialsstore";
import {MessageConstants} from "../utils/messageconstants";
import {TYPES} from "../utils/constants";
import {SignIn} from "../commands/signin";
import {RemoteLogin} from "../../dal/remotelogin";
import {Settings} from "../entities/settings";
import {Output} from "../../view/output";
import {PersistentStorageManager} from "./persistentstoragemanager";
import {TeamCityStatusBarItem} from "../../view/teamcitystatusbaritem";
import {MessageManager} from "../../view/messagemanager";
import {WindowProxy} from "../moduleproxies/window-proxy";

@injectable()
export class InMemoryCredentialsStore implements CredentialsStore {

    constructor(@inject(TYPES.RemoteLogin) private readonly remoteLogin: RemoteLogin,
                @inject(TYPES.Output) private readonly output: Output,
                @inject(TYPES.Settings) private readonly settings: Settings,
                @inject(TYPES.PersistentStorageManager) private persistentStorageManager: PersistentStorageManager,
                @inject(TYPES.TeamCityStatusBarItem) private readonly statusBarItem: TeamCityStatusBarItem,
                @inject(TYPES.MessageManager) private readonly messageManager: MessageManager,
                @inject(TYPES.WindowProxy) private readonly windowProxy: WindowProxy) {
        //
    }

    private credentials: Credentials;

    public async setCredentials(credentials: Credentials): Promise<void> {
        this.credentials = credentials;
    }

    public async getCredentials(): Promise<Credentials> {
        let credentials: Credentials = this.getCredentialsSilently();
        if (!credentials) {
            Logger.logInfo("InMemoryCredentialsStore#getCredentials: credentials is undefined. An attempt to get them");
            await this.signIn();
            credentials = this.getCredentialsSilently();
            if (!credentials) {
                Logger.logWarning("InMemoryCredentialsStore#getCredentials: An attempt to get credentials failed");
                return Promise.reject(MessageConstants.NO_CREDENTIALS_RUN_SIGNIN);
            }
        }
        return Promise.resolve<Credentials>(credentials);
    }

    private async signIn(): Promise<void> {
        const signInCommand = new SignIn(this.remoteLogin, this, this.output, this.settings,
                                         this.persistentStorageManager, this.statusBarItem,
                                         this.messageManager, this.windowProxy);
        return signInCommand.exec();
    }

    public getCredentialsSilently(): Credentials {
        return this.credentials;
    }

    public async removeCredentials(): Promise<void> {
        if (this.credentials) {
            Logger.logInfo(`The credentials for ${this.credentials.user} will be deleted from the CredentialsStore`);
            this.credentials = undefined;
        }
    }

}
