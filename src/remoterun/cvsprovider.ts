"use strict";

import { workspace, SourceControlResourceState, extensions } from "vscode";
import { Constants } from "../utils/constants";
import * as cp from 'child-process-promise';

export interface CvsSupportProvider {
    getFormattedFilenames() : Promise<string[]>;
    generateConfigFileContent() : Promise<string>;
    getAbsPaths() : Promise<string[]>;
}

/**
 * This implementation of CvsSupportProvider uses git command line. So git should be in the user classpath. 
 */
export class GitSupportProvider implements CvsSupportProvider {
    private readonly _workspaceRootPath : string;

    public constructor() {
        this._workspaceRootPath = workspace.rootPath;
    }

    /**
     * @return - A promise for array of formatted names of files, that are required for TeamCity remote run.
     */
    public async getFormattedFilenames() : Promise<string[]> {
        const api = extensions.getExtension(Constants.GIT_EXTENSION_ID).exports;
        const changedFiles = api.getResources();

        const remoteBranch = await this.getRemoteBrunch();
        let firstMonthRevHash = await this.getFirstMonthRev();
        const lastRevHash = await this.getLastRevision(remoteBranch);
        let formatedChangedFiles = [];
        firstMonthRevHash = firstMonthRevHash ? firstMonthRevHash + "-" : "";
        changedFiles.forEach((row) => {
            const absolutePath : string = row.resourceUri.fsPath;
            const relativePath : string = absolutePath.replace(this._workspaceRootPath, "");
            formatedChangedFiles.push(`jetbrains.git://${firstMonthRevHash}${lastRevHash}||${relativePath}`);
        });
        return formatedChangedFiles;
    }

    private async getRemoteBrunch() {
        const getRemoteBranchCommand : string = `git -C "${this._workspaceRootPath}" branch -vv --format='%(upstream:short)'`;
        const prom = await cp.exec(getRemoteBranchCommand);
        const remoteBranch : string = prom.stdout;
        if (remoteBranch === undefined || remoteBranch.length === 0){
            throw "Remote branch wasn't determined."
        }
        return remoteBranch.replace(/'/g, "");
    }

    private async getLastRevision(remoteBranch ) {
        const getLastRevCommand : string = `git -C "${this._workspaceRootPath}" merge-base HEAD ${remoteBranch}`;   
        const prom = await cp.exec(getLastRevCommand);
        const lastRevHash : string = prom.stdout;
        if (lastRevHash === undefined || lastRevHash.length === 0){
            throw "Revision of last commit wasn't determined."
        }
        return lastRevHash.trim();
    }

    private async getFirstMonthRev() {
        const date : Date = new Date();
        const getFirstMonthRevCommand : string = `git -C "${this._workspaceRootPath}" rev-list --reverse --since="${date.getFullYear()}.${date.getMonth() + 1}.1" HEAD`;
        let prom = await cp.exec(getFirstMonthRevCommand);
        let firstRevHash : string = prom.stdout;
        if (firstRevHash === undefined){
            firstRevHash = "";
        }
        return firstRevHash.split("\n")[0];
    }

    /* Currently @username part of content was removed by me. TODO: understand what is it and for which purpose is it used. */
    public async generateConfigFileContent() : Promise<string> {
        const getRemoteUrlCommand : string = `git -C "${this._workspaceRootPath}" ls-remote --get-url`;
        let prom = await cp.exec(getRemoteUrlCommand);
        let remoteUrl : string = prom.stdout;
        if (remoteUrl === undefined || remoteUrl.length === 0){
            throw "Remote url wasn't determined."
        }
        return `.=jetbrains.git://|${remoteUrl.trim()}|`;
    }

    /**
     * This method uses git extension api to get absolute paths of staged files.
     * @return absolute paths of staged files.
     */
    public async getAbsPaths() : Promise<string[]> {
        try{ 
            const absPaths : string[] = [];
            const api = extensions.getExtension(Constants.GIT_EXTENSION_ID).exports;
            const changedFiles : SourceControlResourceState[] = api.getResources(); //TODO: change api!
            changedFiles.forEach((row) => {
                absPaths.push(row.resourceUri.fsPath);
            });
            return absPaths;
        }catch(err){
            return [];
        }
    }
}

export class TfsSupportProvider implements CvsSupportProvider {

    public async getFormattedFilenames() : Promise<string[]> {
        let formatFilenames : string[] = [];
        let api : any = extensions.getExtension(Constants.TFS_EXTENSION_ID).exports;
        let guid : string = api.getCollectionId();
        let serverUris : string[] = api.getCheckinServerUris();
        if ( serverUris === undefined ){
            return [];
        }
        serverUris.forEach((row) => {
            formatFilenames.push(`tfs://guid://${guid}${row}`);
        });
        return formatFilenames;
    }

    /**
     * This method generates content of the ".teamcity-mappings.properties" file to map local changes to remote.
     * @return content of the ".teamcity-mappings.properties" file
     */
    public async generateConfigFileContent() : Promise<string> {
        let api : any = extensions.getExtension(Constants.TFS_EXTENSION_ID).exports;
        let guid : any = api.getCollectionId();
        let projectRootPath : any = api.getProjectRootPath();
        return `.=tfs://guid://${guid.trim()}/$/${projectRootPath.trim()}`;
    }
    
    /**
     * This method uses tfs extension api to get absolute paths of staged files.
     * @return absolute paths of staged files.
     */
    public async getAbsPaths() : Promise<string[]> {
        try{
            let absPaths : string[] = extensions.getExtension(Constants.TFS_EXTENSION_ID).exports.getCheckinInfo().files;
            if (absPaths){
                return absPaths;
            }else{
                return [];
            }
        }catch(err){
            return [];
        }
    }
}
