"use strict";

import {RcaPublicKey} from "../interfaces/rcapublickey";

export interface IRemoteLogin {
    getFullServerVersion(): Promise<string>;

    /**
     * @return - Promise for RSAPublicKey object from node-forge module.
     */
    getPublicKey(): Promise<RcaPublicKey>;

    /**
     * @param user - user name
     * @param password - user password
     * @return - Promise<any>. In case of success it returns the line in a format ${sessionId}:${userId}
     */
    authenticate(user: string, password: string): Promise<string>;
    logout(): Promise<boolean>;
}
