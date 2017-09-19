"use strict";

import * as xmlrpc from "xmlrpc";
import * as forge from "node-forge";
import {Logger} from "../bll/utils/logger";
import {injectable} from "inversify";
import {RemoteLogin} from "./remotelogin";
import {VsCodeUtils} from "../bll/utils/vscodeutils";
import {RcaPublicKey} from "./rcapublickey";
import {MessageConstants} from "../bll/utils/messageconstants";
const BigInteger = forge.jsbn.BigInteger;
const pki = forge.pki;

@injectable()
export class RemoteLoginImpl implements RemoteLogin {

    /**
     * @param user - user name
     * @param password - user password
     * @return - Promise<any>. In case of success it returns the line in a format ${sessionId}:${userId}
     */
    async authenticate(serverUrl: string, user: string, password: string): Promise<string> {
        const client = this.createClient(serverUrl);
        const rsaPublicKey: RcaPublicKey = await this.getPublicKey(client);
        if (!rsaPublicKey) {
            throw MessageConstants.XMLRPC_AUTH_EXCEPTION + " rsaPublicKey is absent";
        }
        const encPass = rsaPublicKey.encrypt(password);
        const hexEncPass = forge.util.createBuffer(encPass).toHex();
        return new Promise<string>((resolve, reject) => {
            client.methodCall("RemoteAuthenticationServer.authenticate", [user, hexEncPass], (err, data) => {
                /* tslint:disable:no-null-keyword */
                if (err !== null) {
                    Logger.logError("RemoteAuthenticationServer.authenticate: return an error: " + VsCodeUtils.formatErrorMessage(err));
                    return reject(err);
                }
                /* tslint:enable:no-null-keyword */
                resolve(data);
            });
        });
    }

    private createClient(serverUrl: string): any {
        return xmlrpc.createClient({url: serverUrl + "/RPC2", cookies: true});
    }

    /**
     * @return - Promise for RSAPublicKey object from node-forge module.
     */
    private getPublicKey(client: any): Promise<RcaPublicKey> {
        if (!client && !client.methodCall) {
            throw Error("Incorrect client!");
        }
        return new Promise<RcaPublicKey>((resolve, reject) => {
            client.methodCall("RemoteAuthenticationServer.getPublicKey", [], (err, data) => {
                /* tslint:disable:no-null-keyword */
                if (err !== null || data === undefined) {
                    Logger.logError(`RemoteAuthenticationServer.getPublicKey: it failed at getting public key: ${VsCodeUtils.formatErrorMessage(err)}`);
                    return reject(err);
                }
                /* tslint:enable:no-null-keyword */
                const keys: string[] = VsCodeUtils.parseValueColonValue(data);
                if (!keys || keys.length !== 2) {
                    return reject("RemoteLoginImpl#getPublicKey: wrong number of arguments");
                }
                const rsaPublicKey: RcaPublicKey = pki.setRsaPublicKey(
                    new BigInteger(keys[0]/* n */, 16),
                    new BigInteger(keys[1]/* e */, 16));
                resolve(rsaPublicKey);
            });
        });
    }
}
