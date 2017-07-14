"use struct";

import { workspace, SourceControlResourceState } from "vscode";
import { VsCodeUtils } from "./utils/vscodeutils";
import * as cp from 'child_process';

export interface CvsSupportProvider{
    formatChangedFilenames(changedFiles : SourceControlResourceState[] ) : Promise<string[]>;
}

export class GitSupportProvider implements CvsSupportProvider{
    private readonly _workspaceRootPath : string;

    public constructor(){
        this._workspaceRootPath = workspace.rootPath;
    }

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
}