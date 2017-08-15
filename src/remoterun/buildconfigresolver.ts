"use strict";

import xmlrpc = require("xmlrpc");
import xml2js = require("xml2js");
import { Logger } from "../utils/logger";
import { Strings } from "../utils/constants";
import { Constants } from "../utils/constants";
import { VsCodeUtils } from "../utils/vscodeutils";
import { ProjectItem } from "../entities/projectitem";
import { BuildConfigItem } from "../entities/leaveitems";
import { Credential } from "../credentialstore/credential";
import { XmlRpcProvider } from "../entities/xmlrpcprovider";

export interface BuildConfigResolver {
    /* async */ getSuitableBuildConfigs( tcFormatedFilePaths : string[], cred : Credential) : Promise<ProjectItem[]>;
}

export class XmlRpcBuildConfigResolver extends XmlRpcProvider implements BuildConfigResolver {

    constructor(serverURL : string) {
        super(serverURL);
    }

    //TODO: simplify it! Think of try/catch
    /**
     *
     * @param tcFormatedFilePaths - Сhanged file paths in particular format. The information is required to create request for suitableBuildConfigIds.
     * @param cred - credential of TeamCity user who try to connect to TeamCity.
     * @return - A promise for an array of ProjectItem objects, that are releted to changed files.
     */
    public async getSuitableBuildConfigs(tcFormatedFilePaths : string[], cred : Credential) : Promise<ProjectItem[]> {
        if (!cred) {
            Logger.logError(`XmlRpcBuildConfigResolver#getSuitableBuildConfigs: credential should not be undefined. Try to sign in again.`);
            throw new Error(`Credential should not be undefined. Try to sign in again!`);
        }

        await this.authenticateIfRequired(cred);
        let configIds : string[] = [];
        try {
            configIds = await this.requestConfigIds(tcFormatedFilePaths);
        }catch (err) {
            Logger.logError(`XmlRpcBuildConfigResolver#getSuitableBuildConfigs: unexpected exception during getting suitable configurations: ${VsCodeUtils.formatErrorMessage(err)}`);
            throw new Error(Strings.GET_SUITABLE_CONFIG_EXCEPTION);
        }
        const projectContainer : ProjectItem[] = await this.getRelatedProjects(configIds);
        Logger.logDebug(`XmlRpcBuildConfigResolver#getSuitableBuildConfigs: projects before filtering: `);
        Logger.LogObject(projectContainer);
        await this.filterConfigs(projectContainer, configIds);
        Logger.logDebug(`XmlRpcBuildConfigResolver#getSuitableBuildConfigs: projects after filtering: `);
        Logger.LogObject(projectContainer);
        return projectContainer;
    }

    /**
     *
     * @param changedFiles - AbsPaths to changed files.
     * @return - Array of all suitable Build Config Ids.
     */
    private async requestConfigIds(serverPaths : string[]) : Promise<string[]> {
        if (this.client.getCookie(Constants.XMLRPC_SESSIONID_KEY) === undefined) {
            Logger.logError("XmlRpcBuildConfigResolver#requestConfigIds: user is not authorized. Session key is empty.");
            throw new Error("Something went wrong. Try to signin again.");
        }
        //Sometimes Server Path contains incorrect backslash simbols.
        const changedFiles : string[] = [];
        serverPaths.forEach((row) => {
            changedFiles.push(row.replace(/\\/g, "/"));
        });
        Logger.logDebug(`XmlRpcBuildConfigResolver#requestConfigIds: changedFiles: ${changedFiles.join(";")}`);
        const prom : Promise<string[]> = new Promise((resolve, reject) => {
            this.client.methodCall("VersionControlServer.getSuitableConfigurations", [ changedFiles ], function (err, confIds) {
                /* tslint:disable:no-null-keyword */
                if (err !== null || confIds === undefined) {
                    Logger.logError("VersionControlServer.getSuitableConfigurations failed with error: " + VsCodeUtils.formatErrorMessage(err));
                    return reject(err);
                }
                /* tslint:enable:no-null-keyword */
                Logger.logDebug("XmlRpcBuildConfigResolver#requestConfigIds: extension recieved config Ids");
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
        if (this.client.getCookie(Constants.XMLRPC_SESSIONID_KEY) === undefined) {
            Logger.logError("XmlRpcBuildConfigResolver#requestConfigIds: user is not authorized. Session key is empty.");
            throw new Error("Something went wrong. Try to signin again.");
        }
        try {
            return new Promise<ProjectItem[]>((resolve, reject) => {
                this.client.methodCall("RemoteBuildServer2.getRelatedProjects", [ confIds ], (err, buildsXml) => {
                    /* tslint:disable:no-null-keyword */
                    if (err !== null || buildsXml === undefined ) {
                        Logger.logError("RemoteBuildServer2.getRelatedProjects failed with error: " + VsCodeUtils.formatErrorMessage(err));
                        return reject(err);
                    }
                    /* tslint:enable:no-null-keyword */
                    Logger.logDebug("XmlRpcBuildConfigResolver#getRelatedProjects: extension recieved builds");
                    resolve(this.parseXml(buildsXml));
                });
            });
        }catch (err) {
            Logger.logError("XmlRpcBuildConfigResolver#getRelatedProjects: " + Strings.GET_BUILDS_EXCEPTION + " /n caused by: " + VsCodeUtils.formatErrorMessage(err));
            throw new Error(Strings.GET_BUILDS_EXCEPTION);
        }
    }

    /**
    *
    * @param buildsXml - xml that contains all info about releted projects.
    * @return - list of ProjectItems that contain related buildConfigs.
    */
    private parseXml(buildsXml : string[]) : ProjectItem[] {
        if (buildsXml === undefined) {
            Logger.logWarning("XmlRpcBuildConfigResolver#parseXml: buildsXml is empty");
            return [];
        }
        const projects : ProjectItem[] = [];
        Logger.logDebug("XmlRpcBuildConfigResolver#parseXml: start collect projects");
        for (let i : number = 0; i < buildsXml.length; i++ ) {
            const buildXml = buildsXml[i];
            xml2js.parseString(buildXml, (err, project) => {
                this.collectProject(project, projects);
            });
        }
        Logger.logDebug("XmlRpcBuildConfigResolver#parseXml: collected projects:");
        Logger.LogObject(projects);
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
            buildConfigs.push(new BuildConfigItem(xmlConfig.id[0], xmlConfig.myExternalId[0], xmlConfig.name[0]));
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
    }

    /**
     * The object that provids api for private fields and methods of class.
     * Use for test purposes only!
     */
    public getTestObject() : any {
        const testObject : any = {};
        testObject._xmlRpcClient = this.client;
        testObject.parseXml = this.parseXml;
        testObject.collectProject = this.collectProject;
        testObject.filterConfigs = this.filterConfigs;
        return testObject;
    }
}
