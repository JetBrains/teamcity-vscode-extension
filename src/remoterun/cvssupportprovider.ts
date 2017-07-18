"use strict";

import { workspace, SourceControlResourceState } from "vscode";
import * as cp from 'child-process-promise';

export interface CvsSupportProvider {
    formatChangedFilenames(changedFiles : SourceControlResourceState[] ) : Promise<string[]>;
    generateConfigFileContent() : Promise<string>;
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
     * 
     * @param changedFiles - changed file for remote run.
     * @result - A promise for array of formatted names of files, that are required for TeamCity remote run.
     */
    public async formatChangedFilenames(changedFiles : SourceControlResourceState[] ) : Promise<string[]> {
        const remoteBranch = await this.getRemoteBrunch();
        let firstMonthRevHash = await this.getFirstMonthRev();
        const lastRevHash = await this.getLastRevision(remoteBranch);
        let formatedChangedFiles = [];
        firstMonthRevHash = firstMonthRevHash ? firstMonthRevHash + "-" : "";
        for (let i = 0; i < changedFiles.length; i++) {
            const absolutePath : string = changedFiles[i].resourceUri.fsPath;
            const relativePath : string = absolutePath.replace(this._workspaceRootPath, "");
            formatedChangedFiles.push(`jetbrains.git://${firstMonthRevHash}${lastRevHash}||${relativePath}`);
        }
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

    /*Currently @username part of content was removed by me. TODO: understand what is it and for which purpose is it used. */
    public async generateConfigFileContent() : Promise<string> {
        const getRemoteUrlCommand : string = `git -C "${this._workspaceRootPath}" ls-remote --get-url`;
        let prom = await cp.exec(getRemoteUrlCommand);
        let remoteUrl : string = prom.stdout;
        if (remoteUrl === undefined || remoteUrl.length === 0){
            throw "Remote url wasn't determined."
        }
        return `.=jetbrains.git://|${remoteUrl.trim()}|`;
    }
}