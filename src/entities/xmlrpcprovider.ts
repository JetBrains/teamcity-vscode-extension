"use strict";

import xmlrpc = require("xmlrpc");
import forge = require("node-forge");
import {Logger} from "../utils/logger";
import {Constants} from "../utils/constants";
import {VsCodeUtils} from "../utils/vscodeutils";
import {MessageConstants} from "../utils/MessageConstants";
import {Credentials} from "../credentialsstore/credentials";
const BigInteger = forge.jsbn.BigInteger;

export class XmlRpcProvider {
    private readonly _client;

    constructor(serverURL: string) {
        this._client = xmlrpc.createClient({url: serverURL + "/RPC2", cookies: true});
    }

    /**
     * @return XmlRpc client that was created at the constructor.
     */
    protected get client(): any {
        return this._client;
    }

    /**
     * @return - Promise for RSAPublicKey object from node-forge module.
     */
    private async getRSAPublicKey(): Promise<any> {
        try {
            return new Promise((resolve, reject) => {
                this._client.methodCall("RemoteAuthenticationServer.getPublicKey", [], (err, data) => {
                    /* tslint:disable:no-null-keyword */
                    if (err !== null || data === undefined) {
                        return reject(err);
                    }
                    /* tslint:enable:no-null-keyword */
                    const pki = forge.pki;
                    const keys: string[] = VsCodeUtils.parseValueColonValue(data);

                    if (!keys || keys.length !== 2) {
                        return reject(err);
                    }
                    const rsaPublicKey = pki.setRsaPublicKey(
                        new BigInteger(keys[0]/* n */, 16),
                        new BigInteger(keys[1]/* e */, 16));
                    resolve(rsaPublicKey);
                });
            });
        } catch (err) {
            Logger.logError(`XmlRpcProvider#getRSAPublicKey: caught an error during getting RSAPublicKEy: ${VsCodeUtils.formatErrorMessage(err)}`);
            throw new Error(MessageConstants.RCA_PUBLIC_KEY_EXCEPTION);
        }
    }

    /**
     * @param credentials - user credential
     * @return - Promise<any>. In case of success the local XmlRpcClient object should be filled by
     * received sessionIdKey and userId will be set to the credential object
     */
    private async authenticate(credentials: Credentials) {
        const rsaPublicKey = await this.getRSAPublicKey();
        if (!rsaPublicKey) {
            throw MessageConstants.XMLRPC_AUTH_EXCEPTION + " rsaPublicKey is absent";
        }
        try {
            const pass = credentials.pass;
            const encPass = rsaPublicKey.encrypt(pass);
            const hexEncPass = forge.util.createBuffer(encPass).toHex();
            return new Promise((resolve, reject) => {
                this._client.methodCall("RemoteAuthenticationServer.authenticate", [credentials.user, hexEncPass], (err, data) => {
                    /* tslint:disable:no-null-keyword */
                    if (err !== null || data === undefined || data.length === 0) {
                        Logger.logError("RemoteAuthenticationServer.authenticate: return an error: " + VsCodeUtils.formatErrorMessage(err));
                        return reject(err);
                    }
                    /* tslint:enable:no-null-keyword */
                    const sessionIdUserId = VsCodeUtils.parseValueColonValue(data);
                    if (!sessionIdUserId || sessionIdUserId.length !== 2) {
                        return reject(err);
                    }
                    credentials.userId = sessionIdUserId[1];
                    this._client.setCookie(Constants.XMLRPC_SESSIONID_KEY, sessionIdUserId[0]);
                    Logger.logDebug(`XmlRpcProvider#authenticate: user id is ${sessionIdUserId[1]}, session id is ${sessionIdUserId[0]}`);
                    resolve();
                });
            });
        } catch (err) {
            Logger.logError(`XmlRpcProvider#authenticate: caught an error during xmlrpc authentication: ${VsCodeUtils.formatErrorMessage(err)}`);
            throw new Error(MessageConstants.XMLRPC_AUTH_EXCEPTION);
        }
    }

    /**
     * Call an authentication method in case of sessionKey or userId absence
     * @param credentials - user credential
     */
    protected async authenticateIfRequired(credentials: Credentials): Promise<void> {
        if (!this.client.getCookie(Constants.XMLRPC_SESSIONID_KEY) || credentials.userId === undefined) {
            Logger.logDebug("XmlRpcProvider#authenticateIfRequired: authentication is required");
            await this.authenticate(credentials);
        }

        if (!this.client.getCookie(Constants.XMLRPC_SESSIONID_KEY) || credentials.userId === undefined) {
            Logger.logDebug("XmlRpcProvider#authenticateIfRequired: authentication via XmlRpc failed. Try to sign in again");
            throw new Error("Cannot connect via XmlRpc. Try to sign in again.");
        }
    }

    /**
     * The object that provides api for private fields and methods of class.
     * Use for test purposes only!
     */
    public getTestObject(): any {
        const testObject: any = {};
        testObject.client = this.client;
        return testObject;
    }
}
