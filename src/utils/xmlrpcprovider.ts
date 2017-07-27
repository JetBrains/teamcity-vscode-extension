"use strict";
import forge = require("node-forge");
import xmlrpc = require("xmlrpc");
import { Credential } from "../credentialstore/credential";
import { VsCodeUtils } from "./vscodeutils";
import { Constants } from "./constants";
import { Strings } from "./strings";
const BigInteger = forge.jsbn.BigInteger;

export class XmlRpcProvider {
    private readonly _client;

    constructor(serverURL : string) {
        this._client = xmlrpc.createClient( { url: serverURL + "/RPC2", cookies: true } );
    }

    /**
     * @return XmlRpc cliend that was created at the constructor.
     */
    protected get client() : any {
        return this._client;
    }

    /**
     * @return - Promise for RSAPublicKey object from node-forge module.
     */
    private async getRSAPublicKey() : Promise<any> {
        try {
            return new Promise((resolve, reject) => {
                this._client.methodCall("RemoteAuthenticationServer.getPublicKey", [], (err, data) => {
                    /* tslint:disable:no-null-keyword */
                    if (err !== null || data === undefined) {
                        return reject(err);
                    }
                    /* tslint:enable:no-null-keyword */
                    const pki = forge.pki;
                    const keys : string[] = VsCodeUtils.parseValueColonValue(data);

                    if (keys.length !== 2) {
                        return reject(err);
                    }
                    const rsaPublicKey = pki.setRsaPublicKey(
                        new BigInteger(keys[0]/* n */, 16),
                        new BigInteger(keys[1]/* e */, 16));
                    resolve(rsaPublicKey);
                });
            });
        } catch (err) {
            throw Strings.RCA_PUBLIC_KEY_EXCEPTION + " /n caused by: " + err;
        }
    }

    /**
     * @param cred - user credential
     * @return - Promise<any>. In case of success the local XmlRpcClient object should be filled by
     * received sessionIdKey and userId will be setted to the credential object
     */
    private async authenticate(cred : Credential) {
        const rsaPublicKey = await this.getRSAPublicKey();
        if (!rsaPublicKey) {
            throw Strings.XMLRPC_AUTH_EXCEPTION + " rsaPublicKey is absent";
        }
        try {
            const pass = cred.pass;
            const encPass = rsaPublicKey.encrypt(pass);
            const hexEncPass = forge.util.createBuffer(encPass).toHex();
            return new Promise((resolve, reject) => {
                this._client.methodCall("RemoteAuthenticationServer.authenticate", [cred.user, hexEncPass], (err, data) => {
                    /* tslint:disable:no-null-keyword */
                    if (err !== null || data === undefined || data.length === 0) {
                        return reject(err);
                    }
                    /* tslint:enable:no-null-keyword */
                    const sessIduserId = VsCodeUtils.parseValueColonValue(data);
                    cred.userId = sessIduserId[1];
                    this._client.setCookie(Constants.XMLRPC_SESSIONID_KEY, sessIduserId[0]);
                    resolve();
                });
            });
        } catch (err) {
            throw Strings.XMLRPC_AUTH_EXCEPTION + " /n caused by: " + err;
        }
    }

    /**
     * Call an authentication method in case of sessionKey or userId absence
     * @param cred - user credential
     */
    protected async authenticateIfRequired(cred : Credential) : Promise<void> {
        if (!this.client.getCookie(Constants.XMLRPC_SESSIONID_KEY) || cred.userId === undefined) {
            await this.authenticate(cred);
        }

        if (!this.client.getCookie(Constants.XMLRPC_SESSIONID_KEY) || cred.userId === undefined) {
            throw "Cannot connect via XmlRpc!";
        }
    }

     /**
     * The object that provids api for private fields and methods of class.
     * Use for test purposes only!
     */
    public getTestObject() : any {
        const testObject : any = {};
        testObject.client = this.client;
        return testObject;
    }
}
