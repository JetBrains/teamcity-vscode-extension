"use strict";

import {Credentials} from "./credentials";

export interface CredentialsStore {
    setCredential(credentials: Credentials): void;
    getCredential(): Credentials;
    removeCredential(): Promise<void>;
}
