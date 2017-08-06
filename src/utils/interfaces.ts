"use strict";
import { CvsProviderTypes } from "../utils/constants";

export interface CheckinInfo {
    message: string;
    fileAbsPaths: string[];
    serverItems: string[];
    workItemIds: number[];
}

export interface TfsInfo {
    repositoryUrl : string;
    collectionName : string;
    projectLocalPath : string;
    projectRemotePath : string;
}

export interface CvsInfo {
    cvsType : CvsProviderTypes;
    path: string;
    versionErrorMsg: string;
    isChanged: boolean;
}