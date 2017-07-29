"use strict";

export interface CheckinInfo {
    message: string;
    files: string[];
    serverItems: string[];
    workItemIds: number[];
}

export interface TfsInfo {
    repositoryUrl : string;
    collectionName : string;
    projectLocalPath : string;
    projectRemotePath : string;
}
