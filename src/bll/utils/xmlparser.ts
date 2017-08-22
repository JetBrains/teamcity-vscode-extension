"use strict";

import * as xml2js from "xml2js";
import {Logger} from "./logger";
import {VsCodeUtils} from "./vscodeutils";
import {ProjectItem} from "../entities/projectitem";
import {QueuedBuild} from "./queuedbuild";
import {BuildConfigItem} from "../entities/buildconfigitem";
import {SummaryDataProxy} from "../entities/summarydataproxy";

export class XmlParser {

    /**
     * @param buildsXml - xml that contains all info about related projects.
     * @return - list of ProjectItems that contain related buildConfigs.
     */
    public static async parseBuilds(buildsXml: string[]): Promise<ProjectItem[]> {
        if (buildsXml === undefined) {
            Logger.logWarning("XmlRpcBuildConfigResolver#parseXml: buildsXml is empty");
            return [];
        }
        const projects: ProjectItem[] = [];
        Logger.logDebug("XmlRpcBuildConfigResolver#parseXml: start collect projects");
        for (let i: number = 0; i < buildsXml.length; i++) {
            const buildXml = buildsXml[i];
            await new Promise<{}>((resolve, reject) => {
                xml2js.parseString(buildXml, (err, project) => {
                    if (err) {
                        reject(err);
                    }
                    XmlParser.collectProject(project, projects);
                    resolve();
                });
            });
        }
        Logger.logDebug("XmlRpcBuildConfigResolver#parseXml: collected projects:");
        Logger.LogObject(projects);
        return projects;
    }

    public static parseSummary(summeryXmlObj : string) : Promise<SummaryDataProxy> {
        return new Promise<SummaryDataProxy>((resolve, reject) => {
            xml2js.parseString(summeryXmlObj, (err, obj) => {
                if (err) {
                    Logger.logError("NotificationProvider#getSummeryData: caught an error during parsing summary data: " + VsCodeUtils.formatErrorMessage(err));
                    reject(err);
                }
                resolve(new SummaryDataProxy(obj.Summary));
            });
        });
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

    public static parseQueuedBuild(queuedBuildInfoXml: string) : Promise<QueuedBuild> {
        return new Promise<QueuedBuild>((resolve, reject) => {
            xml2js.parseString(queuedBuildInfoXml, (err, queuedBuildInfo) => {
                if (err) {
                    Logger.logError(`XmlParser#parseQueuedBuild: cannot parse queuedBuildInfo. An error occurs ${VsCodeUtils.formatErrorMessage(err)}`);
                    reject(`XmlParser#parseQueuedBuild: cannot parse queuedBuildInfo`);
                }
                resolve(queuedBuildInfo.build.$);
            });
        });
    }

    public static parseBuildStatus(buildInfoXml: string) : Promise<string> {
        return new Promise<string>((resolve, reject) => {
            xml2js.parseString(buildInfoXml, (err, buildInfo) => {
                if (err) {
                    reject(`XmlParser#parseBuildInfo: Can't parse buildInfoXml ${VsCodeUtils.formatErrorMessage(err)}`);
                }
                if (!buildInfo
                    || !buildInfo.build
                    || !buildInfo.build.$
                    || !buildInfo.build.$.state
                    || !buildInfo.build.$.status
                    || buildInfo.build.$.state !== "finished") {
                    resolve(undefined);
                }
                resolve(buildInfo.build.$.status);
            });
        });
    }
}
