"use strict";

import {XmlRpcProvider} from "../entities/xmlrpcprovider";
import {BuildConfigResolver} from "../interfaces/BuildConfigResolver";
import {Credentials} from "../credentialsstore/credentials";
import {ProjectItem} from "../entities/projectitem";
import {Logger} from "../utils/logger";
import {VsCodeUtils} from "../utils/vscodeutils";
import {Constants} from "../utils/constants";
import {MessageConstants} from "../utils/MessageConstants";
import * as xml2js from "xml2js";
import {BuildConfigItem} from "../entities/buildconfigitem";

export class XmlRpcBuildConfigResolver extends XmlRpcProvider implements BuildConfigResolver {

    constructor(serverURL: string) {
        super(serverURL);
    }

    //TODO: simplify it! Think of try/catch
    /**
     *
     * @param tcFormattedFilePaths - Changed file paths in particular format. The information is required to create request for suitableBuildConfigIds.
     * @param credentials - credential of TeamCity user who try to connect to TeamCity.
     * @return - A promise for an array of ProjectItem objects, that are related to changed files.
     */
    public async getSuitableBuildConfigs(tcFormattedFilePaths: string[], credentials: Credentials): Promise<ProjectItem[]> {
        if (!credentials) {
            Logger.logError(`XmlRpcBuildConfigResolver#getSuitableBuildConfigs: credential should not be undefined. Try to sign in again.`);
            throw new Error(`Credential should not be undefined. Try to sign in again!`);
        }

        await this.authenticateIfRequired(credentials);
        let configurationId: string[] = [];
        try {
            configurationId = await this.requestConfigIds(tcFormattedFilePaths);
        } catch (err) {
            Logger.logError(`XmlRpcBuildConfigResolver#getSuitableBuildConfigs: unexpected exception during getting suitable configurations: ${VsCodeUtils.formatErrorMessage(err)}`);
            throw new Error(MessageConstants.GET_SUITABLE_CONFIG_EXCEPTION);
        }
        const projectContainer: ProjectItem[] = await this.getRelatedProjects(configurationId);
        Logger.logDebug(`XmlRpcBuildConfigResolver#getSuitableBuildConfigs: projects before filtering: `);
        Logger.LogObject(projectContainer);
        await this.filterConfigs(projectContainer, configurationId);
        Logger.logDebug(`XmlRpcBuildConfigResolver#getSuitableBuildConfigs: projects after filtering: `);
        Logger.LogObject(projectContainer);
        return projectContainer;
    }

    /**
     *
     * @param serverPaths - AbsPaths to changed files.
     * @return - Array of all suitable Build Config Ids.
     */
    private async requestConfigIds(serverPaths: string[]): Promise<string[]> {
        //Sometimes Server Path contains incorrect backslash symbols.
        const changedFiles: string[] = [];
        serverPaths.forEach((row) => {
            changedFiles.push(row.replace(/\\/g, "/"));
        });
        Logger.logDebug(`XmlRpcBuildConfigResolver#requestConfigIds: changedFiles: ${changedFiles.join(";")}`);
        return new Promise<string[]>((resolve, reject) => {
            this.client.methodCall("VersionControlServer.getSuitableConfigurations", [changedFiles], function (err, configurationId) {
                /* tslint:disable:no-null-keyword */
                if (err !== null || configurationId === undefined) {
                    Logger.logError("VersionControlServer.getSuitableConfigurations failed with error: " + VsCodeUtils.formatErrorMessage(err));
                    return reject(err);
                }
                /* tslint:enable:no-null-keyword */
                Logger.logDebug("XmlRpcBuildConfigResolver#requestConfigIds: extension received config Ids");
                resolve(configurationId);
            });
        });
    }

    /**
     *
     * @param configurationId - Array of configuration build ids. Extension requests all related projects to collect full information
     * about build configurations (including projectNames and buildConfigurationName). The information is required to create label for BuildConfig.
     * @return - list of ProjectItems that contain related buildConfigs.
     */
    private async getRelatedProjects(configurationId: string[]): Promise<ProjectItem[]> {
        try {
            return new Promise<ProjectItem[]>((resolve, reject) => {
                this.client.methodCall("RemoteBuildServer2.getRelatedProjects", [configurationId], (err, buildsXml) => {
                    /* tslint:disable:no-null-keyword */
                    if (err !== null || buildsXml === undefined) {
                        Logger.logError("RemoteBuildServer2.getRelatedProjects failed with error: " + VsCodeUtils.formatErrorMessage(err));
                        return reject(err);
                    }
                    /* tslint:enable:no-null-keyword */
                    Logger.logDebug("XmlRpcBuildConfigResolver#getRelatedProjects: extension received builds");
                    resolve(this.parseXml(buildsXml));
                });
            });
        } catch (err) {
            Logger.logError("XmlRpcBuildConfigResolver#getRelatedProjects: " + MessageConstants.GET_BUILDS_EXCEPTION + " /n caused by: " + VsCodeUtils.formatErrorMessage(err));
            throw new Error(MessageConstants.GET_BUILDS_EXCEPTION);
        }
    }

    /**
     *
     * @param buildsXml - xml that contains all info about related projects.
     * @return - list of ProjectItems that contain related buildConfigs.
     */
    private parseXml(buildsXml: string[]): ProjectItem[] {
        if (buildsXml === undefined) {
            Logger.logWarning("XmlRpcBuildConfigResolver#parseXml: buildsXml is empty");
            return [];
        }
        const projects: ProjectItem[] = [];
        Logger.logDebug("XmlRpcBuildConfigResolver#parseXml: start collect projects");
        for (let i: number = 0; i < buildsXml.length; i++) {
            const buildXml = buildsXml[i];
            xml2js.parseString(buildXml, (err, project) => {
                XmlRpcBuildConfigResolver.collectProject(project, projects);
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
    private static collectProject(project: any, projectContainer: ProjectItem[]) {
        if (!project || !project.Project || !project.Project.configs ||
            !project.Project.configs[0] || !project.Project.configs[0].Configuration) {
            return;
        }
        const xmlConfigurations: any = project.Project.configs[0].Configuration;
        const buildConfigurations: BuildConfigItem[] = [];
        for (let i = 0; i < xmlConfigurations.length; i++) {
            const xmlConfiguration = xmlConfigurations[i];
            if (!xmlConfiguration.id || !xmlConfiguration.id[0] ||
                !xmlConfiguration.name || !xmlConfiguration.name[0] ||
                !xmlConfiguration.projectName || !xmlConfiguration.projectName[0]) {
                continue;
            }
            buildConfigurations.push(new BuildConfigItem(xmlConfiguration.id[0], xmlConfiguration.myExternalId[0], xmlConfiguration.name[0]));
        }
        if (buildConfigurations.length > 0) {
            projectContainer.push(new ProjectItem(project.Project.name[0], buildConfigurations));
        }
    }

    /**
     *
     * @param projects - array of ProjectItems that contain all project's buildConfigs.
     * @param configurationIds - array of ids of suitable build configs.
     * @return - contains at the first arg, not at @return clause. List of projects with only suitable build configs.
     */
    private async filterConfigs(projects: ProjectItem[], configurationIds: string[]) {
        projects.forEach((project) => {
            const filteredConfigs: BuildConfigItem[] = [];
            project.configs.forEach((configuration) => {
                if (configurationIds.indexOf(configuration.id) !== -1) {
                    filteredConfigs.push(configuration);
                }
            });
            project.configs = filteredConfigs;
        });
    }
}
