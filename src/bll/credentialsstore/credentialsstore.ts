import {Credentials} from "./credentials";

export interface CredentialsStore {
    setCredentials(credentials: Credentials): Promise<void>;
    getCredentials(): Promise<Credentials>;
    getCredentialsSilently(): Credentials;
    removeCredentials(): Promise<void>;
}
