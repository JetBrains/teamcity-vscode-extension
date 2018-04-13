import {Credentials} from "../credentials";
import {Logger} from "../../utils/logger";
import {OsxKeychain} from "./osx-keychain-access";
import {inject, injectable} from "inversify";
import {Constants, TYPES} from "../../utils/constants";
import {CredentialsStore} from "../credentialsstore";
import {Utils} from "../../utils/utils";

@injectable()
export class OsxKeychainApi implements CredentialsStore {
    public static separator: string = "|";

    private osxKeychain: OsxKeychain;

    constructor(@inject(TYPES.OsxKeychain) osxKeychain: OsxKeychain) {
        this.osxKeychain = osxKeychain;
        this.osxKeychain.setPrefix(Constants.SERVICE_PREFIX);

    }

    public async getCredentials(): Promise<Credentials> {
        let credentials: Credentials;
        const credentialsList: Credentials[] = await this.listCredentials();

        if (credentialsList.length > 0) {
            credentials = credentialsList[0];
        }

        if (credentialsList.length > 1) {
            Logger.logWarning("[OsxKeychainApi::getCredential] there are more then one suitable credentials for the user! " +
                "The first will be taken.");
        }

        if (credentials) {
            const password: string = await this.getPasswordFromKeyChain(credentials);
            return new Credentials(credentials.serverURL, credentials.user, password, undefined, undefined);
        }
    }

    private getPasswordFromKeyChain(credentials: Credentials): Promise<string> {
        const targetName: string = OsxKeychainApi.createTargetName(credentials.serverURL, credentials.user);
        return this.osxKeychain.getPasswordForUser(targetName);
    }

    public setCredentials(credentials: Credentials): Promise<void> {
        const targetName: string = OsxKeychainApi.createTargetName(credentials.serverURL, credentials.user);
        return this.osxKeychain.set(targetName, "", credentials.password);
    }

    public async removeCredentials(): Promise<void> {
        const credentialsList: Credentials[] = await this.listCredentials();

        if (credentialsList && credentialsList.length > 0) {
            for (let i = 0; i < credentialsList.length; i++) {
                const credentials: Credentials = credentialsList[i];
                const targetName: string = OsxKeychainApi.createTargetName(credentials.serverURL, credentials.user);
                await this.removeCredentialByName(targetName);
            }
        }
    }

    public async removeCredentialByName(targetName: string): Promise<void> {
        const description = "";
        try {
            await this.osxKeychain.remove(targetName, description);
        } catch (err) {
            const CREDENTIALS_NOT_FOUND_CODE = 44;
            if (err.code && err.code !== CREDENTIALS_NOT_FOUND_CODE) {
                throw err;
            } else {
                Logger.logError(`OsxKeychainApi#removeCredentialByName: ${err}`);
            }
        }
    }

    private listCredentials(): Promise<Credentials[]> {
        const credentialsList: Credentials[] = [];

        const stream = this.osxKeychain.getCredentialsWithoutPasswordsListStream();
        stream.on("data", (cred) => {
            if (cred.svce && cred.svce.indexOf(Constants.SERVICE_PREFIX) === 0) {
                try {
                    const credentials: Credentials = OsxKeychainApi.createCredentialsWithoutPassword(cred.acct);
                    credentialsList.push(credentials);
                } catch (err) {
                    Logger.logError("[OsxKeychainApi::listCredentials] could not collect credentials. with err: "
                    + Utils.formatErrorMessage(err));
                }
            }
        });
        return new Promise<Credentials[]>((resolve, reject) => {
            stream.on("end", () => {
                resolve(credentialsList);
            });
            stream.on("error", (error) => {
                console.log(error);
                reject(error);
            });
        });
    }

    private static createCredentialsWithoutPassword(targetName: string): Credentials {
        const segments: string[] = targetName.split(OsxKeychainApi.separator);
        const url: string = new Buffer(segments[0], "hex").toString("utf8");
        const username: string = new Buffer(segments[1], "hex").toString("utf8");
        return new Credentials(url, username, undefined, undefined, undefined);
    }

    private static createTargetName(url: string, username: string): string {
        const encryptedUrl: string = new Buffer(url, "utf8").toString("hex");
        const encryptedUsername: string = new Buffer(username, "utf8").toString("hex");
        return encryptedUrl + OsxKeychainApi.separator + encryptedUsername;
    }

    getCredentialsSilently(): Credentials {
        throw new Error("Method not supported.");
    }
}
