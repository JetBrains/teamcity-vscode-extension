"use strict";

import {RcaPublicKey} from "./rcapublickey";

export interface RemoteLogin {
    authenticate(serverUrl: string, user: string, password: string): Promise<string>;
}
