import {WindowsCredentialStoreApi} from "./win32/win-credstore-api";
import {LinuxFileApi} from "./linux/linux-file-api";
import {Credentials} from "./credentials";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {OsxKeychainApi} from "./osx/osx-keychain-api";
import {CredentialsStore} from "./credentialsstore";
import {OsProxy} from "../moduleproxies/os-proxy";
import {Logger} from "../utils/logger";
import {Utils} from "../utils/utils";

@injectable()
export class PersistentStorageManager implements CredentialsStore {
    private credentialsStore: CredentialsStore;

    public constructor(@inject(TYPES.WindowsCredentialStoreApi) windowsCredentialsStoreApi: WindowsCredentialStoreApi,
                       @inject(TYPES.LinuxFileApi) linuxFileApi: LinuxFileApi,
                       @inject(TYPES.OsxKeychainApi) osxKeychainApi: OsxKeychainApi,
                       @inject(TYPES.OsProxy) os: OsProxy) {

        switch (os.platform()) {
            case "win32":
                this.credentialsStore = windowsCredentialsStoreApi;
                break;
            case "darwin":
                this.credentialsStore = osxKeychainApi;
                break;
            /* tslint:disable:no-switch-case-fall-through */
            case "linux":
            default:
                /* tslint:enable:no-switch-case-fall-through */
                this.credentialsStore = linuxFileApi;
                break;
        }
    }

    public async getCredentials(): Promise<Credentials> {
        return this.credentialsStore.getCredentials();
    }

    private async tryGetCredentials(): Promise<Credentials> {
        let creds: Credentials = undefined;
        try {
            creds = await this.credentialsStore.getCredentials();
        } catch (err) {
            Logger.logError(`[PersistentStorageManager:tryGetCredentials] an error occurs during getting credentials ${Utils.formatErrorMessage(err)}`);
        }
        return creds;
    }

    public async setCredentials(credentials: Credentials): Promise<void> {
        const cred: Credentials = await this.tryGetCredentials();
        if (cred) {
            await this.removeCredentials();
        }
        await this.credentialsStore.setCredentials(credentials);
    }

    public removeCredentials(): Promise<void> {
        return this.credentialsStore.removeCredentials();
    }

    getCredentialsSilently(): Credentials {
        throw new Error("Method not supported.");
    }
}
