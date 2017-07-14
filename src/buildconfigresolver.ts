"use struct";
import { Credential } from "./credentialstore/credential";
import { Strings } from "./utils/strings";
import { Constants } from "./utils/constants";
import xmlrpc = require("xmlrpc");
import forge = require('node-forge');
const BigInteger = forge.jsbn.BigInteger;

export interface BuildConfigResolver{
    /* async */ getSuitableBuildConfig( changedFiles : string[]) : Promise<string[]>;
}

export class XmlRpcBuildConfigResolver implements BuildConfigResolver{
    private readonly _xmlRpcClient;
    private readonly _creds : Credential;
    private readonly XMLRPC_SESSIONID_KEY : string = "xmlrpcsessionId";
    
    constructor(creds : Credential){
        this._xmlRpcClient = xmlrpc.createClient({ url: creds.serverURL + "/RPC2", cookies: true });
        this._creds = creds;
    }

    public async getSuitableBuildConfig(changedFiles : string[]) : Promise<string[]> {
        const rsaPublicKey = await this.getRSAPublicKey();
        await this.xmlRpcAuthentication(rsaPublicKey);
        return await this.requestConfigs(changedFiles);
    }

    private async getRSAPublicKey() : Promise<any> {
        try{
            return new Promise((resolve, reject) => {
                this._xmlRpcClient.methodCall('RemoteAuthenticationServer.getPublicKey', [], (err, data) => {
                    if(err !== null || data === undefined) return reject(err);
                    const pki = forge.pki;
                    const rsa = forge.pki.rsa;
                    const keys = this.extractKeys(data);

                    if (keys.length !== 2) return reject(err);
                    const rsaPublicKey = pki.setRsaPublicKey(
                        new BigInteger(keys[0]/* n */, 16),
                        new BigInteger(keys[1]/* e */, 16));
                    resolve(rsaPublicKey);
                });
            });
        } catch(err){
            throw Strings.RCA_PUBLIC_KEY_EXCEPTION + " /n caused by: " + err;
        }
    }

    private async xmlRpcAuthentication(rsaPublicKey/*RSAPublicKey from node-forge module*/) : Promise<any> {
        if (rsaPublicKey)
        try{
            const pass = this._creds.pass;
            const encPass = rsaPublicKey.encrypt(pass);
            const hexEncPass = forge.util.createBuffer(encPass).toHex();
            return new Promise((resolve, reject) => {
                this._xmlRpcClient.methodCall('RemoteAuthenticationServer.authenticate', [this._creds.user, hexEncPass], (err, sessId) => {
                    if(err !== null || sessId === undefined || sessId.length == 0) return reject(err);
                    this._xmlRpcClient.setCookie(Constants.XMLRPC_SESSIONID_KEY, sessId);
                    resolve();
                });
            });
        } catch(err){
            throw Strings.XMLRPC_AUTH_EXCEPTION + " /n caused by: " + err;
        }
    }
    
    private async requestConfigs(changedFiles : string[]) : Promise<string[]>{
        if (this._xmlRpcClient.getCookie(Constants.XMLRPC_SESSIONID_KEY) === undefined){
            throw "You are not authorized";
        }
        try{
            const prom : Promise<string[]> = new Promise((resolve, reject) => { 
                this._xmlRpcClient.methodCall("VersionControlServer.getSuitableConfigurations", [ changedFiles ], function (err, confIds) {
                    if(err !== null || confIds === undefined) return reject(err);
                    resolve(confIds);
                });
            });
            return prom;
        }catch(err){
            throw Strings.GET_SUITABLE_CONFIG_EXCEPTION + " /n caused by: " + err;
        }
    }

    private async getRelatedBuilds(confIds : string[]) : Promise<string[]>{
        if (this._xmlRpcClient.getCookie(Constants.XMLRPC_SESSIONID_KEY) === undefined){
            throw "You are not authorized";
        }
        try{
            return new Promise<string[]>((resolve, reject) => {
                this._xmlRpcClient.methodCall("RemoteBuildServer2.getRelatedProjects", [ confIds ], function (err, builds) {
                    if(err !== null || builds === undefined) return reject(err);
                    resolve(builds);
                });
            });
        }catch(err){
            throw Strings.GET_BUILDS_EXCEPTION + " /n caused by: " + err;
        }
    }
   
    private extractKeys(key : string) : string[] {
        const KEY_SEPARATOR : string = ":";
        if (key == null || !key.indexOf(KEY_SEPARATOR)) return null;
        var keys = key.split(KEY_SEPARATOR);
        return keys.length != 2 ? null : keys;
    }

    public getTestObject() : any {
        let testObject : any = {};
        testObject.extractKeys = this.extractKeys; 
        testObject.getRSAPublicKey = this.getRSAPublicKey; 
        return testObject;
    }
}

