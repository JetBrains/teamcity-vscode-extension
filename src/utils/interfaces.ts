"use strict";

import * as stream from "stream";
import { CvsLocalResource } from "../entities/leaveitems";
import { CvsProviderTypes, CvsFileStatusCode } from "../utils/constants";

export interface CheckinInfo {
    message: string;
    cvsLocalResources: CvsLocalResource[];
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

export interface Remote {
    name: string;
    url: string;
}

export interface MappingFileContent {
    localRootPath: string;
    tcProjectRootPath: string;
    fullContent : string;
}

export interface RestHeader {
    header : string;
    value : string;
}

export interface QueuedBuild {
    id : string;
    buildTypeId : string;
    state : string;
    personal : boolean;
    href: string;
    webUrl: string;
}

export interface ReadableSet {
    stream : stream.Readable;
    length : number;
}
