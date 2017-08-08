"use strict";
import forge = require("node-forge");
import xmlrpc = require("xmlrpc");
import { Credential } from "../credentialstore/credential";
import { VsCodeUtils } from "./vscodeutils";
import { Constants } from "./constants";
import { Strings } from "./strings";
import { Logger } from "./logger";
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
            Logger.logError(`XmlRpcProvider#getRSAPublicKey: caught an error during gettign RSAPublicKEy: ${VsCodeUtils.formatErrorMessage(err)}`);
            throw new Error(Strings.RCA_PUBLIC_KEY_EXCEPTION);
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
                        Logger.logError("RemoteAuthenticationServer.authenticate: return an error: " + VsCodeUtils.formatErrorMessage(err));
                        return reject(err);
                    }
                    /* tslint:enable:no-null-keyword */
                    const sessIduserId = VsCodeUtils.parseValueColonValue(data);
                    if (!sessIduserId || sessIduserId.length !== 2) {
                        return reject(err);
                    }
                    cred.userId = sessIduserId[1];
                    this._client.setCookie(Constants.XMLRPC_SESSIONID_KEY, sessIduserId[0]);
                    Logger.logDebug(`XmlRpcProvider#authenticate: user id is ${sessIduserId[1]}, session id is ${sessIduserId[0]}`);
                    resolve();
                });
            });
        } catch (err) {
            Logger.logError(`XmlRpcProvider#authenticate: caught an error during xmlrpc authentication: ${VsCodeUtils.formatErrorMessage(err)}`);
            throw new Error(Strings.XMLRPC_AUTH_EXCEPTION);
        }
    }

    /**
     * Call an authentication method in case of sessionKey or userId absence
     * @param cred - user credential
     */
    protected async authenticateIfRequired(cred : Credential) : Promise<void> {
        if (!this.client.getCookie(Constants.XMLRPC_SESSIONID_KEY) || cred.userId === undefined) {
            Logger.logDebug("XmlRpcProvider#authenticateIfRequired: authentication is required");
            await this.authenticate(cred);
        }

        if (!this.client.getCookie(Constants.XMLRPC_SESSIONID_KEY) || cred.userId === undefined) {
            Logger.logDebug("XmlRpcProvider#authenticateIfRequired: authentication via XmlRpc failed. Try to sign in again");
            throw new Error("Cannot connect via XmlRpc. Try to sign in again.");
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

export class XmlRpcProvider2 extends XmlRpcProvider {
    public async doSmt(ss : string) {
        const cred : Credential = new Credential("http://localhost", "rugpanov", "");
        await this.authenticateIfRequired(cred);
        await this.doSmts(ss);

    }

    private async doSmts(ss : string) : Promise<string[]> {
        if (this.client.getCookie(Constants.XMLRPC_SESSIONID_KEY) === undefined) {
           throw new Error("Something went wrong. Try to signin again.");
        }
        //Sometimes Server Path contains incorrect backslash simbols.
        const addToQueueRequests = [];
        addToQueueRequests.push(`<AddToQueueRequest><changeListId>${ss}</changeListId><buildTypeId>bt3</buildTypeId><myPutBuildOnTheQueueTop>false</myPutBuildOnTheQueueTop><myRebuildDependencies>false</myRebuildDependencies><myCleanSources>false</myCleanSources></AddToQueueRequest>`);

        const triggedBy = "##userId='1' IDEPlugin='VsCode Plagin'";
        const prom : Promise<string[]> = new Promise((resolve, reject) => {
            this.client.methodCall("RemoteBuildServer2.addToQueue", [ addToQueueRequests, triggedBy ], function (err, confIds) {
                /* tslint:disable:no-null-keyword */
                if (err !== null || confIds === undefined) {
                   return reject(err);
                }
                /* tslint:enable:no-null-keyword */
                resolve(confIds);
            });
        });
        return prom;
    }
}
