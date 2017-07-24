"use strict";
import { Credential } from "../credentialstore/credential";
import { Strings } from "../utils/strings";
import { Constants } from "../utils/constants";
import { ProjectItem, BuildConfigItem } from "../remoterun/configexplorer";
import xmlrpc = require("xmlrpc");
import forge = require("node-forge");
import xml2js = require("xml2js");
const BigInteger = forge.jsbn.BigInteger;

export interface BuildConfigResolver {
    /* async */ getSuitableBuildConfigs( tcFormatedFilePaths : string[], cred : Credential) : Promise<ProjectItem[]>;
}

export class XmlRpcBuildConfigResolver implements BuildConfigResolver {
    private _xmlRpcClient;
    private _cred : Credential;

    //TODO: simplify it! Think of try/catch
    /**
     *
     * @param tcFormatedFilePaths - Сhanged file paths in particular format. The information is required to create request for suitableBuildConfigIds.
     * @param cred - credential of TeamCity user who try to connect to TeamCity.
     * @return - A promise for an array of ProjectItem objects, that are releted to changed files.
     */
    public async getSuitableBuildConfigs(tcFormatedFilePaths : string[], cred : Credential) : Promise<ProjectItem[]> {
        if (!cred) {
            throw "Credential should not be undefined.";
        }
        this._xmlRpcClient = xmlrpc.createClient( { url: cred.serverURL + "/RPC2", cookies: true } );
        this._cred = cred;

        const rsaPublicKey = await this.getRSAPublicKey();
        await this.xmlRpcAuthentication(rsaPublicKey);
        let configIds : string[] = [];
        try {
            configIds = await this.requestConfigIds(tcFormatedFilePaths);
        }catch (err) {
            throw Strings.GET_SUITABLE_CONFIG_EXCEPTION;
        }
        const projectContainer : ProjectItem[] = await this.getRelatedProjects(configIds);
        await this.filterConfigs(projectContainer, configIds);

        return projectContainer;
    }

    /**
     * @return - Promise for RSAPublicKey object from node-forge module.
     */
    private async getRSAPublicKey() : Promise<any> {
        try {
            return new Promise((resolve, reject) => {
                this._xmlRpcClient.methodCall("RemoteAuthenticationServer.getPublicKey", [], (err, data) => {
                    /* tslint:disable:no-null-keyword */
                    if (err !== null || data === undefined) {
                        return reject(err);
                    }
                    /* tslint:enable:no-null-keyword */
                    const pki = forge.pki;
                    const rsa = forge.pki.rsa;
                    const keys = this.extractKeys(data);

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
                this._xmlRpcClient.methodCall("RemoteAuthenticationServer.authenticate", [this._cred.user, hexEncPass], (err, sessId) => {
                    /* tslint:disable:no-null-keyword */
                    if (err !== null || sessId === undefined || sessId.length === 0) {
                        return reject(err);
                    }
                    /* tslint:enable:no-null-keyword */
                    this._xmlRpcClient.setCookie(Constants.XMLRPC_SESSIONID_KEY, sessId);
                    resolve();
                });
            });
        } catch (err) {
            throw Strings.XMLRPC_AUTH_EXCEPTION + " /n caused by: " + err;
        }
    }

    /**
     *
     * @param changedFiles - AbsPaths to changed files.
     * @return - Array of all suitable Build Config Ids.
     */
    private async requestConfigIds(serverPaths : string[]) : Promise<string[]> {
        if (this._xmlRpcClient.getCookie(Constants.XMLRPC_SESSIONID_KEY) === undefined) {
            throw "You are not authorized";
        }
        //Sometimes Server Path contains incorrect backslash simbols.
        const changedFiles : string[] = [];
        serverPaths.forEach((row) => {
            changedFiles.push(row.replace(/\\/g, "/"));
        });
        const prom : Promise<string[]> = new Promise((resolve, reject) => {
            this._xmlRpcClient.methodCall("VersionControlServer.getSuitableConfigurations", [ changedFiles ], function (err, confIds) {
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

    /**
     *
     * @param confIds - Array of configuration build ids. Extension requests all related projects to collect full information
     * about build configurations (including projectNames and buildConfigurationName). The information is required to create label for BuildConfig.
     * @return - list of ProjectItems that contain related buildConfigs.
     */
    private async getRelatedProjects(confIds : string[]) : Promise<ProjectItem[]> {
        if (this._xmlRpcClient.getCookie(Constants.XMLRPC_SESSIONID_KEY) === undefined) {
            throw "You are not authorized";
        }
        try {
            return new Promise<ProjectItem[]>((resolve, reject) => {
                this._xmlRpcClient.methodCall("RemoteBuildServer2.getRelatedProjects", [ confIds ], (err, buildsXml) => {
                    /* tslint:disable:no-null-keyword */
                    if (err !== null || buildsXml === undefined ) {
                        return reject(err);
                    }
                    /* tslint:enable:no-null-keyword */
                    resolve(this.parseXml(buildsXml));
                });
            });
        }catch (err) {
            throw Strings.GET_BUILDS_EXCEPTION + " /n caused by: " + err;
        }
    }

    /**
    *
    * @param buildsXml - xml that contains all info about releted projects.
    * @return - list of ProjectItems that contain related buildConfigs.
    */
    private parseXml(buildsXml : string[]) : ProjectItem[] {
        if (buildsXml === undefined) {
            return [];
        }
        const projects : ProjectItem[] = [];
        for (let i : number = 0; i < buildsXml.length; i++ ) {
            const buildXml = buildsXml[i];
            xml2js.parseString(buildXml, (err, project) => {
                this.collectProject(project, projects);
            });
        }
        return projects;
    }

    /**
     * This method receives a TeamCity project entity, extracts ProjectItem and pushes it to second argument.
     * @param project - project as a TeamCity project entity with lots of useless fields.
     * @param projectContainer - the result of the call of the method will be pushed to this object.
     */
    private collectProject(project : any, projectContainer : ProjectItem[]) {
        if (!project || !project.Project || !project.Project.configs ||
            !project.Project.configs[0] || !project.Project.configs[0].Configuration) {
            return;
        }
        const xmlConfigs : any = project.Project.configs[0].Configuration;
        const buildConfigs : BuildConfigItem[] = [];
        for (let i = 0; i < xmlConfigs.length; i++) {
            const xmlConfig = xmlConfigs[i];
            if (!xmlConfig.id || !xmlConfig.id[0] ||
                !xmlConfig.name || !xmlConfig.name[0] ||
                !xmlConfig.projectName || !xmlConfig.projectName[0]) {
                    continue;
                }
            buildConfigs.push(new BuildConfigItem(xmlConfig.id[0], xmlConfig.name[0]));
        }
        if (buildConfigs.length > 0) {
            projectContainer.push(new ProjectItem(project.Project.name[0], buildConfigs));
        }
    }

    /**
     *
     * @param projects - array of ProjectItems that contain all project's buildConfigs.
     * @param configIds - array of ids of suitable build configs.
     * @return - contains at the first arg, not at @return clause. List of projects with only suitable build configs.
     */
    private async filterConfigs(projects : ProjectItem[], configIds : string[]) {
        projects.forEach((project) => {
            const filteredConfigs : BuildConfigItem[] = [];
            project.configs.forEach((config) => {
                if (configIds.indexOf(config.id) !== -1) {
                    filteredConfigs.push(config);
                }
            });
            project.configs = filteredConfigs;
        });
        return;
    }

    /**
     *
     * @param key - public key in the format ${n:e}
     * @return - public key as array in the format ${[n, e]}
     */
    private extractKeys(key : string) : string[] {
        const KEY_SEPARATOR : string = ":";
        if (key === undefined || !key.indexOf(KEY_SEPARATOR)) {
            return undefined;
        }
        const keys = key.split(KEY_SEPARATOR);
        return keys.length !== 2 ? undefined : keys;
    }

    /**
     * The object that provids api for private fields and methods of class.
     * Use for test purposes only!
     */
    public getTestObject() : any {
        const testObject : any = {};
        testObject._cred = this._cred;
        testObject._xmlRpcClient = this._xmlRpcClient;
        testObject.extractKeys = this.extractKeys;
        testObject.getRSAPublicKey = this.getRSAPublicKey;
        testObject.parseXml = this.parseXml;
        testObject.collectProject = this.collectProject;
        testObject.filterConfigs = this.filterConfigs;
        return testObject;
    }
}
