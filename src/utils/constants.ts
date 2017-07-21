"use strict";

export enum CvsProviderTypes { Git, Tfs, UndefinedCvs }
export class Constants {
    public static readonly XMLRPC_SESSIONID_KEY : string = "xmlrpcsessionId";
    public static readonly HTTP_STATUS_OK = 200;
    public static readonly HTTP_STATUS_UNAUTHORIZED = 401;
    public static readonly GIT_EXTENSION_ID = "vscode.git";
    public static readonly TFS_EXTENSION_ID = "ms-vsts.team";
}
