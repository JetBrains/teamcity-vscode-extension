"use strict";
import { Credential } from "../credentialstore/credential";
import { Strings } from "../utils/strings";
import { Constants } from "../utils/constants";
import { BuildConfig } from "../remoterun/configexplorer";
import xmlrpc = require("xmlrpc");
import forge = require("node-forge");
import xml2js = require('xml2js');
const BigInteger = forge.jsbn.BigInteger;

export interface BuildConfigResolver {
    /* async */ getSuitableBuildConfig( tcFormatedFilePaths : string[], cred : Credential) : Promise<BuildConfig[]>;
}

export class XmlRpcBuildConfigResolver implements BuildConfigResolver {
    private _xmlRpcClient;
    private _cred : Credential;
    
    
    //TODO: simplify it! Think of try/catch
    /**
     * 
     * @param tcFormatedFilePaths - Сhanged file paths in particular format. The information is required to create request for suitableBuildConfigIds.
     * @param cred - credential of TeamCity user who try to connect to TeamCity. 
     * @return - A promise for an array of BuildConfig objects, that are releted to changed files.
     */
    public async getSuitableBuildConfig(tcFormatedFilePaths : string[], cred : Credential) : Promise<BuildConfig[]> {
        if (!cred) {
            throw "Credential should not be undefined.";
        }
        this._xmlRpcClient = xmlrpc.createClient( { url: cred.serverURL + "/RPC2", cookies: true } );
        this._cred = cred;

        const rsaPublicKey = await this.getRSAPublicKey();
        await this.xmlRpcAuthentication(rsaPublicKey);
        let configIds : string[] = [];
        try{
            configIds = await this.requestConfigIds(tcFormatedFilePaths);
        }catch(err){
            throw Strings.GET_SUITABLE_CONFIG_EXCEPTION;
        }
        const configsInfo : string[] = await this.getRelatedConfigs(configIds); 

        let buildConfigs : BuildConfig[] = [];
        for (let i = 0; i < configIds.length; i++) {
            if (!configsInfo[configIds[i]]) {
                continue;
            }
            buildConfigs.push(new BuildConfig(configIds[i], configsInfo[configIds[i]]))
        }

        return buildConfigs;
    }

    /**
     * @return - Promise for RSAPublicKey object from node-forge module. 
     */
    private async getRSAPublicKey() : Promise<any> {
        try {
            return new Promise((resolve, reject) => {
                this._xmlRpcClient.methodCall('RemoteAuthenticationServer.getPublicKey', [], (err, data) => {
                    if(err !== null || data === undefined) {
                        return reject(err);
                    }
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
        } catch(err) {
            throw Strings.RCA_PUBLIC_KEY_EXCEPTION + " /n caused by: " + err;
        }
    }

    /**
     * 
     * @param rsaPublicKey - RSAPublicKey from node-forge module
     * @return - Promise<any>. In case of success the local XmlRpcClient object should be filled by received sessionIdKey.
     */
    private async xmlRpcAuthentication(rsaPublicKey) {
        if (!rsaPublicKey) {
            throw Strings.XMLRPC_AUTH_EXCEPTION + " rsaPublicKey is absent";
        }
        try {
            const pass = this._cred.pass;
            const encPass = rsaPublicKey.encrypt(pass);
            const hexEncPass = forge.util.createBuffer(encPass).toHex();
            return new Promise((resolve, reject) => {
                this._xmlRpcClient.methodCall('RemoteAuthenticationServer.authenticate', [this._cred.user, hexEncPass], (err, sessId) => {
                    if(err !== null || sessId === undefined || sessId.length == 0) return reject(err);
                    this._xmlRpcClient.setCookie(Constants.XMLRPC_SESSIONID_KEY, sessId);
                    resolve();
                });
            });
        } catch(err) {
            throw Strings.XMLRPC_AUTH_EXCEPTION + " /n caused by: " + err;
        }
    }
    
    /**
     * 
     * @param changedFiles - AbsPaths to changed files.
     * @return - Array of all suitable Build Config Ids. 
     */
    private async requestConfigIds(serverPaths : string[]) : Promise<string[]> {
        if (this._xmlRpcClient.getCookie(Constants.XMLRPC_SESSIONID_KEY) === undefined){
            throw "You are not authorized";
        }
        //Sometimes Server Path contains incorrect backslash simbols.
        let changedFiles : string[] = []
        serverPaths.forEach((row) => {
            changedFiles.push(row.replace(/\\/g, "/"));
        });
        const prom : Promise<string[]> = new Promise((resolve, reject) => { 
            this._xmlRpcClient.methodCall("VersionControlServer.getSuitableConfigurations", [ changedFiles ], function (err, confIds) {
                if(err !== null || confIds === undefined) return reject(err);
                resolve(confIds);
            });
        });
        return prom;
    }

    /**
     * 
     * @param confIds - Array of configuration build ids. Extension requests all related projects to collect full information 
     * about build configurations (including projectNames and buildConfigurationName). The information is required to create label for BuildConfig.   
     * @return - map of pairs [buildConfigId] - buildConfigLabel. buildConfigLabel is in format ${[projectName] internalBuildConfigName} 
     */
    private async getRelatedConfigs(confIds : string[]) : Promise<string[]>{
        if (this._xmlRpcClient.getCookie(Constants.XMLRPC_SESSIONID_KEY) === undefined){
            throw "You are not authorized";
        }
        try{
            return new Promise<string[]>((resolve, reject) => {
                this._xmlRpcClient.methodCall("RemoteBuildServer2.getRelatedProjects", [ confIds ], (err, buildsXml) => {
                    if(err !== null || buildsXml === undefined ) return reject(err);
                    resolve(this.collectConfigs(buildsXml));
                });
            });
        }catch(err){
            throw Strings.GET_BUILDS_EXCEPTION + " /n caused by: " + err;
        }
    }
   
    /**
    * 
    * @param buildsXml - xml that contains all info about releted projects.
    * @return - map of pairs [buildConfigId] - buildConfigLabel that exist under the project.
    * BuildConfigLabel is in format ${[projectName] internalBuildConfigName} 
    */
    private collectConfigs(buildsXml : string[]) : string[] {
        if (buildsXml === undefined){
            return [];
        }
        let configs : string[] = []
        for (var i : number = 0; i < buildsXml.length; i++ ){
            let buildXml = buildsXml[i];
            xml2js.parseString(buildXml, (err, project) => {
                this.collectConfigsFromProject(project, configs);
            });
        }
        return configs;
    }

    /**
    * 
    * @param buildsXml - an object that contains all info about a project.
    * @return - map of pairs [buildConfigId] - buildConfigLabel that exist under the project. 
    * BuildConfigLabel is in format ${[projectName] internalBuildConfigName} 
    */
    private collectConfigsFromProject(project : any, configs : string[]) {
        if (!project || !project.Project || !project.Project.configs || 
            !project.Project.configs[0] || !project.Project.configs[0].Configuration){
            return;
        }
        const xmlConfigs : any = project.Project.configs[0].Configuration;
        for (let i = 0; i < xmlConfigs.length; i++){
            const xmlConfig = xmlConfigs[i];
            if (!xmlConfig.id || !xmlConfig.id[0] || 
                !xmlConfig.name || !xmlConfig.name[0] ||
                !xmlConfig.projectName || !xmlConfig.projectName[0]){
                    continue;
                }
            configs[xmlConfig.id[0]] = `[${xmlConfig.projectName[0]}] ${xmlConfig.name}`;
        }
    }

    /**
     * 
     * @param key - public key in the format ${n:e}
     * @return - public key as array in the format ${[n, e]}
     */
    private extractKeys(key : string) : string[] {
        const KEY_SEPARATOR : string = ":";
        if (key == null || !key.indexOf(KEY_SEPARATOR)) return null;
        var keys = key.split(KEY_SEPARATOR);
        return keys.length != 2 ? null : keys;
    }

    /**
     * The object that provids api for private fields and methods of class.
     * Use for test purposes only! 
     */
    public getTestObject() : any {
        let testObject : any = {};
        testObject._cred = this._cred;
        testObject._xmlRpcClient = this._xmlRpcClient;
        testObject.extractKeys = this.extractKeys; 
        testObject.getRSAPublicKey = this.getRSAPublicKey; 
        testObject.collectConfigs = this.collectConfigs; 
        testObject.collectConfigsFromProject = this.collectConfigsFromProject; 
        return testObject;
    }
}

