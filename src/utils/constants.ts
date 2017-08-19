"use strict";

export class Constants {
    public static readonly EXTENSION_NAME : string = "teamcity";
    public static readonly EXTENSION_NAME_PREFIX : string = `${Constants.EXTENSION_NAME}.`;
    public static readonly XMLRPC_SESSIONID_KEY : string = "xmlrpcsessionId";
    public static readonly HTTP_STATUS_OK = 200;
    public static readonly HTTP_STATUS_UNAUTHORIZED = 401;
    public static readonly GIT_EXTENSION_ID = "vscode.git";
    public static readonly TFS_EXTENSION_ID = "ms-vsts.team";
    public static readonly LOGGING_LEVEL_SETTING_KEY = `${Constants.EXTENSION_NAME_PREFIX}logging.level`;
    public static readonly SIGNIN_WELCOME_SETTING_KEY = `${Constants.EXTENSION_NAME_PREFIX}show.welcome`;
    public static readonly DEFAULT_USER_URL = `${Constants.EXTENSION_NAME_PREFIX}credentials.url`;
    public static readonly DEFAULT_USER_NAME = `${Constants.EXTENSION_NAME_PREFIX}credentials.username`;
    public static readonly REMOTERUN_ENABLED = `${Constants.EXTENSION_NAME_PREFIX}remoterun.enabled`;

    public static readonly POST_METHOD = "POST";
    public static readonly GET_METHOD = "GET";
}
export enum CvsProviderTypes {
     Git = <any>"Git",
     Tfs = <any>"Tfs",
     UndefinedCvs = <any>"UndefinedCvs"
}
/**
 * Without <any> in front of TrackerEventType prefix ts won't compile the code.
 */
export enum TrackerEventType {
    BUILD_STARTED = <any>"a",
    BUILD_CHANGES_LOADED = <any>"b",
    BUILD_FINISHED = <any>"c",
    BUILD_CHANGED_STATUS = <any>"d",
    BUILD_INTERRUPTED = <any>"e",
    BUILD_REMOVED = <any>"f",
    PERSONAL_BUILD_STARTED = <any>"g",
    PERSONAL_BUILD_FINISHED = <any>"h",
    PERSONAL_BUILD_CHANGED_STATUS = <any>"i",
    PERSONAL_BUILD_INTERRUPTED = <any>"j",
    PERSONAL_BUILD_ADDED_TO_QUEUE = <any>"k",
    PROJECT_RESTORED = <any>"l",
    PROJECT_PERSISTED = <any>"m",
    PROJECT_REMOVED = <any>"n",
    PROJECT_CREATED = <any>"o",
    PROJECT_ARCHIVED = <any>"p",
    PROJECT_DEARCHIVED = <any>"q",
    BUILD_TYPE_REGISTERED = <any>"r",
    BUILD_TYPE_UNREGISTERED = <any>"s",
    BUILD_TYPE_ADDED_TO_QUEUE = <any>"t",
    BUILD_TYPE_REMOVED_FROM_QUEUE = <any>"u",
    BUILD_TYPE_ACTIVE_STATUS_CHANGED = <any>"v",
    BUILD_TYPE_RESPONSIBILITY_CHANGES = <any>"w",
    CHANGE_ADDED = <any>"x",
    BUILD_QUEUE_ORDER_CHANGED = <any>"y",
    AGENT_REGISTERED = <any>"z",
    AGENT_UNREGISTERED = <any>"A",
    AGENT_REMOVED = <any>"B",
    AGENT_STATUS_CHANGED = <any>"C",
    USER_ACCOUNT_CREATED = <any>"D",
    USER_ACCOUNT_REMOVED = <any>"E",
    USER_ACCOUNT_CHANGED = <any>"F",
    NOTIFICATION_RULES_CHANGED = <any>"G",
    SERVER_SHUTDOWN = <any>"H",
    TEST_RESPONSIBILITY_CHANGED = <any>"I",
    TEST_MUTE_UPDATED = <any>"K"
}

export enum ChangeListStatus {
     CHECKED = <any>"CHECKED",
     FAILED = <any>"FAILED"
}

//TODO: Implement replaced status code
export enum CvsFileStatusCode {
    MODIFIED = <any>"M",
    ADDED = <any>"A",
    DELETED = <any>"D",
    RENAMED = <any>"R",
    UNRECOGNIZED = <any>"U"
}

export class Strings {
    static readonly PROVIDE_USERNAME : string = "Provide the username for TeamCity server.";
    static readonly PROVIDE_PASSWORD : string = "Provide the password for username.";
    static readonly PROVIDE_URL : string = "Provide the URL for TeamCity server.";
    static readonly NO_CREDENTIALS_RUN_SIGNIN : string = "You are not connected to a TeamCity server. Please run the 'teamcity Signin' command.";
    static readonly NO_CONFIGS_RUN_REMOTERUN : string = "No selected build configs. Please execute the 'Remote run' command.";
    static readonly NO_TCC_UTIL : string = "Not found tcc.jar. Please reinstall teamcity extension.";
    static readonly SUCCESSFULLY_SIGNEDIN : string = "You are successfully signed in to the TeamCity server.";
    static readonly STATUS_CODE_401 : string = "Unauthorized. Check your authentication credentials and try again.";
    static readonly UNEXPECTED_EXCEPTION : string = "Something went wrong. Please try again or write to support.";
    static readonly RCA_PUBLIC_KEY_EXCEPTION : string = "Unexpected exception during getting RCA public key.";
    static readonly XMLRPC_AUTH_EXCEPTION : string = "Unexpected exception during xmlrpc authentication";
    static readonly GET_SUITABLE_CONFIG_EXCEPTION : string = "Unexpected exception during getting suitable configurations";
    static readonly GET_BUILDS_EXCEPTION : string = "Unexpected exception during getting builds";
}
