"use struct";

import { workspace, SourceControlResourceState } from "vscode";
import { VsCodeUtils } from "../utils/vscodeutils";
import * as cp from 'child_process';

export interface CvsSupportProvider{
    formatChangedFilenames(changedFiles : SourceControlResourceState[] ) : Promise<string[]>;
    generateConfigFileContent() : Promise<string>;
}

/**
 * This implementation of CvsSupportProvider uses git command line. So git should be in the user classpath. 
 */
export class GitSupportProvider implements CvsSupportProvider{
    private readonly _workspaceRootPath : string;

    public constructor(){
        this._workspaceRootPath = workspace.rootPath;
    }

    /**
     * 
     * @param changedFiles - changed file for remote run.
     * @result - A promise for array of formatted names of files, that are required for TeamCity remote run.
     */
    public async formatChangedFilenames(changedFiles : SourceControlResourceState[] ) : Promise<string[]>{
        const remoteBranch = await this.getRemoteBrunch();
        let firstMonthRevHash = await this.getFirstMonthRev();
        const lastRevHash = await this.getLastRevision(remoteBranch);
        let formatedChangedFiles = [];
        firstMonthRevHash = firstMonthRevHash ? firstMonthRevHash + "-" : "";
        for (let i = 0; i < changedFiles.length; i++){
            const absolutePath : string = changedFiles[i].resourceUri.fsPath;
            const relativePath : string = absolutePath.replace(this._workspaceRootPath, "");
            formatedChangedFiles.push(`jetbrains.git://${firstMonthRevHash}${lastRevHash}||${relativePath}`);
        }
        return formatedChangedFiles;
    }

    private async getRemoteBrunch() {
        const getRemoteBranchCommand : string = `git -C "${this._workspaceRootPath}" branch -vv --format='%(upstream:short)'`;
        const prom = new Promise((resolve, reject) => {
            cp.exec(getRemoteBranchCommand, (err, remoteBranch) => {
                if (err || remoteBranch === undefined || remoteBranch.length === 0) reject(err);
                remoteBranch = remoteBranch.replace(/'/g, "");
                resolve(remoteBranch);    
            })
        });
        return prom;
    }

    private async getLastRevision(remoteBranch ) {
        const getLastRevCommand : string = `git -C "${this._workspaceRootPath}" merge-base HEAD ${remoteBranch}`;   
        const prom = new Promise((resolve, reject) => {
            cp.exec(getLastRevCommand, (err, lastRevHash) => {
                if (err || lastRevHash === undefined || lastRevHash.length === 0) reject(err);
                resolve(lastRevHash.trim());    
            })
        });
        return prom;
    }

    private async getFirstMonthRev() {
        const date : Date = new Date();
        const getFirstMonthRevCommand : string = `git -C "${this._workspaceRootPath}" rev-list --reverse --since="${date.getFullYear()}.${date.getMonth() + 1}.1" HEAD`;
        const prom = new Promise((resolve, reject) => {
            cp.exec(getFirstMonthRevCommand, (err, firstRevHash) => {
                if (err || firstRevHash === undefined || firstRevHash.length === 0) reject(err);
                resolve(firstRevHash.split("\n")[0]);    
            })
        });
        return prom;
    }

    /*Currently @username part of content was removed by me. TODO: understand what is it and for which purpose is it used. */
    public async generateConfigFileContent() : Promise<string> {
        const getRemoteUrlCommand : string = `git -C "${this._workspaceRootPath}" ls-remote --get-url`;
         const prom : Promise<string> = new Promise((resolve, reject) => {
            cp.exec(getRemoteUrlCommand, (err, remoteUrl) => {
                if (err || remoteUrl === undefined || remoteUrl.length === 0) reject(err);
                resolve(remoteUrl.trim());    
            })
        });
        const remoteUrl : string = await prom;
        return `.=jetbrains.git://|${remoteUrl}|`;
    }
}