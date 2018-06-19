import {Logger} from "./logger";
import {QueuedBuild} from "./queuedbuild";
import {Constants} from "./constants";
import {Summary} from "../entities/summary";
import {Build} from "../entities/build";
import {injectable} from "inversify";
import {Project} from "../entities/project";
import {BuildConfig} from "../entities/buildconfig";
import {parseString} from "xml2js";

@injectable()
export class XmlParser {

    public async parseProjectsWithRelatedBuilds(
        buildsXml: string[],
        buildConfigFilter: (buildConfig: BuildConfig) => boolean): Promise<Project[]> {
        XmlParser.ensureNotEmpty(buildsXml);

        const projectMap: Map<string, Project> = new Map<string, Project>();
        Logger.logDebug("XmlParser#parseBuilds: start collect projects");
        for (const projectXml of buildsXml) {
            const projectData: any = await parseStringAsync(projectXml);
            const project: Project = XmlParser.parseProject(projectData, buildConfigFilter);
            projectMap.set(project.id, project);
        }

        XmlParser.buildProjectHierarchy(projectMap);

        const result: Project[] = projectMap.get(Constants.ROOT_PROJECT_ID).children;
        Logger.logDebug("XmlParser#parseBuilds: collected projects:");
        Logger.LogObject(result);
        return result;
    }

    private static ensureNotEmpty(data?: string[]) {
        if (!data) {
            throw new Error("Related data were not found.");
        }
    }

    private static parseProject(projectData: any, filterBuildConfig: (buildConfig: BuildConfig) => boolean): Project {
        const parentId = projectData.Project.myParentProjectId ? projectData.Project.myParentProjectId[0] : undefined;
        const project = new Project(projectData.Project.myProjectId[0], parentId, projectData.Project.name[0]);

        if (projectData.Project.configs && projectData.Project.configs[0]) {
            const buildConfigs: BuildConfig[] =
                XmlParser.parseConfigurations(projectData.Project.configs[0].Configuration, filterBuildConfig);
            buildConfigs.forEach((config) => project.addChildBuildConfig(config));
        }
        return project;
    }

    private static parseConfigurations(configDataArray: Array<any>,
                                       filterBuildConfig: (buildConfig: BuildConfig) => boolean): BuildConfig[] {
        const buildConfigs: BuildConfig[] = [];
        for (const configData of configDataArray) {
            const buildConfig = new BuildConfig(configData.id[0], configData.myExternalId[0], configData.name[0]);
            if (filterBuildConfig(buildConfig)) {
                buildConfigs.push(buildConfig);
            }
        }

        return buildConfigs;
    }

    private static buildProjectHierarchy(projectMap: Map<string, Project>) {
        projectMap.forEach((project) => {
            if (project.parentId && projectMap.get(project.parentId)) {
                projectMap.get(project.parentId).addChildProject(project);
            }
        });
    }

    public async parseRestBuild(buildXml: string): Promise<Build> {
        if (buildXml === undefined) {
            Logger.logWarning("XmlParser#parseRestBuild: buildXml is empty");
            return;
        }

        Logger.logDebug("XmlParser#parseRestBuild: start collect projects");
        const buildObj: any = await parseStringAsync(buildXml);
        return Build.fromRestParsedObject(buildObj);
    }

    public async parseSummary(summeryXmlObj: string): Promise<Summary> {
        const dataObj: any = await parseStringAsync(summeryXmlObj);

        return Summary.fromXmlRpcObject(dataObj);
    }

    public async parseQueuedBuild(queuedBuildInfoXml: string): Promise<QueuedBuild> {
        const queuedBuildObj: any = await parseStringAsync(queuedBuildInfoXml);

        return queuedBuildObj.build.$;
    }

    public async parseBuildStatus(buildInfoXml: string): Promise<string> {
        const buildInfoObj: any = await parseStringAsync(buildInfoXml);
        if (!(buildInfoObj.build.$.state === "finished" && buildInfoObj.build.$.status)) {
            return undefined;
        }

        return buildInfoObj.build.$.status;
    }
}

async function parseStringAsync(data: string): Promise<any> {
    return new Promise((resolve, reject) => {
        parseString(data, (err, result) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}
