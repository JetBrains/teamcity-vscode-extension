import {Logger} from "./logger";
import * as xml2js from "xml2js";
import {QueuedBuild} from "./queuedbuild";
import {Constants} from "./constants";
import {Summary} from "../entities/summary";
import {Build} from "../entities/build";
import {injectable} from "inversify";
import {Utils} from "./utils";
import {Project} from "../entities/project";
import {BuildConfig} from "../entities/buildconfig";

@injectable()
export class XmlParser {

    public async parseProjectsWithRelatedBuilds(buildsXml: string[]): Promise<Project[]> {
        if (buildsXml === undefined) {
            Logger.logWarning("XmlParser#parseBuilds: buildsXml is empty");
            return [];
        }
        const projectMap: any = {};
        Logger.logDebug("XmlParser#parseBuilds: start collect projects");
        for (let i: number = 0; i < buildsXml.length; i++) {
            const buildXml = buildsXml[i];
            await new Promise<{}>((resolve, reject) => {
                xml2js.parseString(buildXml, (err, project) => {
                    if (err) {
                        reject(err);
                    }
                    XmlParser.collectProject(project, projectMap);
                    resolve();
                });
            });
        }

        XmlParser.buildProjectHierarchy(projectMap);

        const result: Project[] = projectMap[Constants.ROOT_PROJECT_ID].children;
        Logger.logDebug("XmlParser#parseBuilds: collected projects:");
        Logger.LogObject(result);
        return result;
    }

    /**
     * This method receives a TeamCity project entity, extracts ProjectItem and pushes it to second argument.
     * @param xmlProject - project as a TeamCity project entity
     * @param projectMap - the result of the call of the method will be pushed to this object.
     */
    private static collectProject(xmlProject: any, projectMap: any) {
        if (!xmlProject || !xmlProject.Project || !xmlProject.Project.myProjectId ||
            !xmlProject.Project.name) {
            return;
        }
        const parentId = xmlProject.Project.myParentProjectId ? xmlProject.Project.myParentProjectId[0] : undefined;
        const project = new Project(xmlProject.Project.myProjectId[0], parentId, xmlProject.Project.name[0]);
        const buildConfigs: BuildConfig[] = XmlParser.getBuildConfigs(xmlProject);
        buildConfigs.forEach((config) => project.addChildBuildConfig(config));
        projectMap[project.id] = project;
    }

    private static getBuildConfigs(xmlProject: any) : BuildConfig[] {
        const buildConfigs: BuildConfig[] = [];
        if (xmlProject.Project.configs &&
            xmlProject.Project.configs[0] && xmlProject.Project.configs[0].Configuration) {
            const xmlConfigurations: any = xmlProject.Project.configs[0].Configuration;
            for (let i = 0; i < xmlConfigurations.length; i++) {
                const xmlConfiguration = xmlConfigurations[i];
                if (!xmlConfiguration.id || !xmlConfiguration.id[0] ||
                    !xmlConfiguration.name || !xmlConfiguration.name[0] ||
                    !xmlConfiguration.projectName || !xmlConfiguration.projectName[0]) {
                    continue;
                }
                buildConfigs.push(new BuildConfig(xmlConfiguration.id[0],
                                                  xmlConfiguration.myExternalId[0],
                                                  xmlConfiguration.name[0]));
            }
        }
        return buildConfigs;
    }

    private static buildProjectHierarchy(projectMap: any) {
        for (const projectId of Object.keys(projectMap)) {
            const project = projectMap[projectId];
            if (project.parentId && projectMap[project.parentId]) {
                projectMap[project.parentId].addChildProject(project);
            }
        }
    }

    /**
     * @param buildXml - xml that contains all info about related projects.
     * @return - list of ProjectItems that contain related buildConfigs.
     */
    public async parseRestBuild(buildXml: string): Promise<Build> {
        if (buildXml === undefined) {
            Logger.logWarning("XmlParser#parseRestBuild: buildXml is empty");
            return;
        }
        Logger.logDebug("XmlParser#parseRestBuild: start collect projects");
        return await new Promise<Build>((resolve, reject) => {
            xml2js.parseString(buildXml, (err, buildObj) => {
                if (err) {
                    reject(err);
                }
                const build: Build = Build.fromRestParcedObject(buildObj);
                resolve(build);
            });
        });
    }

    public parseSummary(summeryXmlObj: string): Promise<Summary> {
        return new Promise<Summary>((resolve, reject) => {
            xml2js.parseString(summeryXmlObj, (err, obj) => {
                if (err) {
                    Logger.logError("XmlParser#parseSummary: caught an error during parsing summary data: "
                        + Utils.formatErrorMessage(err));
                    reject(err);
                }
                resolve(Summary.fromXmlRpcObject(obj));
            });
        });
    }

    public parseQueuedBuild(queuedBuildInfoXml: string): Promise<QueuedBuild> {
        return new Promise<QueuedBuild>((resolve, reject) => {
            xml2js.parseString(queuedBuildInfoXml, (err, queuedBuildInfo) => {
                if (err) {
                    Logger.logError(`XmlParser#parseQueuedBuild: cannot parse queuedBuildInfo.
                     An error occurs ${Utils.formatErrorMessage(err)}`);
                    reject(`XmlParser#parseQueuedBuild: cannot parse queuedBuildInfo`);
                }
                resolve(queuedBuildInfo.build.$);
            });
        });
    }

    public parseBuildStatus(buildInfoXml: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            xml2js.parseString(buildInfoXml, (err, buildInfo) => {
                if (err) {
                    reject(`XmlParser#parseBuildInfo: Can't parse buildInfoXml ${Utils.formatErrorMessage(err)}`);
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
