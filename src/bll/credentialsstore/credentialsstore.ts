"use strict";

import {Credentials} from "./credentials";

export interface CredentialsStore {
    setCredentials(credentials: Credentials): void;
    tryGetCredentials(): Promise<Credentials>;
    getCredentialsSilently(): Credentials;
    removeCredentials(): void;
}
