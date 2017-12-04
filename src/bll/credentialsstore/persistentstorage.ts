"use strict";

import {Credentials} from "./credentials";

export interface PersistentStorage {
    getCredentials(): Promise<Credentials>;
    setCredentials(url: string, username: string, password: any): Promise<void>;
    removeCredentials(): Promise<void>;
}
