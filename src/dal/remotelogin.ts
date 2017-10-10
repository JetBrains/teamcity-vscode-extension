"use strict";

export interface RemoteLogin {
    authenticate(serverUrl: string, user: string, password: string): Promise<string>;
}
