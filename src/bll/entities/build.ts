"use strict";

import {Logger} from "../utils/logger";

export class Build {

    public readonly id: number;
    public readonly buildNumber: number;
    public readonly isPersonal: boolean;
    public readonly status: string;
    public readonly name: string;
    public readonly statusText: string;
    public readonly projectName: string;
    public readonly webUrl: string;

    public constructor(
        id: number,
        buildNumber: number,
        isPersonal: boolean,
        status: string,
        name: string = "",
        statusText: string = "",
        projectName: string = "",
        webUrl: string = "") {
        this.id = id;
        this.buildNumber = buildNumber;
        this.isPersonal = isPersonal;
        this.status = status;
        this.name = name;
        this.statusText = statusText;
        this.projectName = projectName;
        this.webUrl = webUrl;
    }

    public static fromXmlRpcObject(buildObj: any): Build {
        const id: number = this.getXmlRpcId(buildObj);
        const buildNumber: number = this.getXmlRpcNumber(buildObj);
        const isPersonal: boolean = this.isPersonalXmlRpc(buildObj);
        const status: string = this.getStatusXmlRpc(buildObj);
        const name: string = this.getName(buildObj);
        const instance: Build = new Build(id, buildNumber, isPersonal, status);
        return instance;
    }

    private static getXmlRpcId(buildObj: any): number {
        if (!buildObj ||
            buildObj.id === undefined ||
            buildObj.id[0] === undefined) {
            return -1;
        }
        return buildObj.id[0];
    }

    private static getXmlRpcNumber(buildObj: any): number {
        if (!buildObj ||
            buildObj.number === undefined ||
            buildObj.number[0] === undefined) {
            return -1;
        }
        return buildObj.number[0];
    }

    private static isPersonalXmlRpc(buildObj: any): boolean {
        if (!buildObj ||
            buildObj.personal === undefined ||
            buildObj.personal[0] === undefined) {
            return false;
        }
        return (buildObj.personal[0] === "true");
    }

    private static getStatusXmlRpc(buildObj: any): string {
        if (!buildObj ||
            !buildObj.statusDescriptor ||
            !buildObj.statusDescriptor[0] ||
            buildObj.statusDescriptor[0].myText === undefined ||
            buildObj.statusDescriptor[0].myText[0] === undefined) {
            return "UNKNOWN";
        }
        return buildObj.statusDescriptor[0].myText[0];
    }

    private static getProjectName(buildObj: any): string {
        if (!buildObj ||
            !buildObj.build ||
            !buildObj.build.buildType ||
            !buildObj.build.buildType[0] ||
            !buildObj.build.buildType[0].$) {

            Logger.logDebug(`BuildItemProxy#projectName: projectName is not reachable. default: undefined`);
            return undefined;
        }
        return buildObj.build.buildType[0].$.projectName;
    }

    public static fromRestParcedObject(buildObj: any): Build {
        const id: number = this.getRestXmlId(buildObj);
        const buildNumber: number = this.getRestXmlNumber(buildObj);
        const isPersonal: boolean = this.isPersonalRestXml(buildObj);
        const status: string = this.getStatusRestXml(buildObj);
        const name: string = this.getName(buildObj);
        const statusText: string = this.getStatusText(buildObj);
        const projectName: string = this.getProjectName(buildObj);
        const webUrl: string = this.getWebUrl(buildObj);
        const instance: Build = new Build(id, buildNumber, isPersonal, status, name, statusText, projectName, webUrl);
        return instance;
    }

    private static getRestXmlId(buildObj: any): number {
        if (!buildObj ||
            !buildObj.build ||
            !buildObj.build.$ ||
            buildObj.build.$.id === undefined) {

            Logger.logDebug(`BuildItemProxy#changeId: changeId is not reachable. default: -1`);
            return -1;
        }
        return buildObj.build.$.id;
    }

    private static getRestXmlNumber(buildObj: any): number {
        if (!buildObj ||
            !buildObj.build ||
            !buildObj.build.$ ||
            buildObj.build.$.number === undefined) {

            Logger.logDebug(`BuildItemProxy#changeId: changeId is not reachable. default: -1`);
            return -1;
        }
        return buildObj.build.$.number;
    }

    private static isPersonalRestXml(buildObj: any): boolean {
        if (!buildObj ||
            !buildObj.build ||
            !buildObj.build.$ ||
            buildObj.build.$.personal === undefined) {

            Logger.logDebug(`BuildItemProxy#isPersonal: isPersonal is not reachable. default: false`);
            return false;
        }
        return (buildObj.build.$.personal === "true");
    }

    private static getStatusRestXml(buildObj: any): string {
        if (!buildObj ||
            !buildObj.build ||
            !buildObj.build.$ ||
            buildObj.build.$.status === undefined) {

            Logger.logDebug(`BuildItemProxy#status: status is not reachable. default: UNKNOWN`);
            return "UNKNOWN";
        }
        return buildObj.build.$.status;
    }

    private static getName(buildObj: any): string {
        if (!buildObj ||
            !buildObj.build ||
            !buildObj.build.buildType ||
            !buildObj.build.buildType[0] ||
            !buildObj.build.buildType[0].$) {

            Logger.logDebug(`BuildItemProxy#projectName: build name is not reachable. default: undefined`);
            return undefined;
        }
        return buildObj.build.buildType[0].$.name;
    }

    private static getWebUrl(buildObj: any): string | undefined {
        if (!buildObj ||
            !buildObj.build ||
            !buildObj.build.$) {
            Logger.logDebug(`BuildItemProxy#status: status is not reachable. default: undefined`);
            return undefined;
        }
        return buildObj.build.$.webUrl;
    }

    private static getStatusText(buildObj: any): string | undefined {
        if (!buildObj ||
            !buildObj.build ||
            !buildObj.build.statusText) {
            Logger.logDebug(`BuildItemProxy#status: status is not reachable. default: empty string`);
            return "";
        }
        return buildObj.build.statusText;
    }
}
