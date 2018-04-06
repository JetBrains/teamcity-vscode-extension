export class Constants {
    public static readonly VISUAL_STUDIO_CODE: string = "Visual Studio Code";
    public static readonly EXTENSION_NAME: string = "teamcity";
    public static readonly EXTENSION_NAME_CAPITALIZED: string = "TeamCity";
    public static readonly EXTENSION_NAME_PREFIX: string = `${Constants.EXTENSION_NAME}.`;
    public static readonly EXTENSION_ID: string = "JetBrains.teamcity-vscode-extension";
    public static readonly XMLRPC_SESSIONID_KEY: string = "xmlrpcsessionId";
    public static readonly LOGGING_LEVEL_SETTING_KEY = `${Constants.EXTENSION_NAME_PREFIX}logging.level`;
    public static readonly SIGNIN_WELCOME_SETTING_KEY = `${Constants.EXTENSION_NAME_PREFIX}show.welcome`;
    public static readonly SHOULD_ASK_STORE_CREDENTIALS = `${Constants.EXTENSION_NAME_PREFIX}credentials.persistent`;
    public static readonly LAST_LOGIN = `${Constants.EXTENSION_NAME_PREFIX}credentials.lastLogin`;
    public static readonly TFS_LOCATION_SETTING_NAME = "tfvc.location";
    public static readonly GIT_PATH_SETTING_NAME = "git.path";
    public static readonly DEFAULT_URL = "http://buildserver";
    public static readonly SERVICE_PREFIX = "jetbrains.teamcity.vscode";

    public static readonly SIGNIN_COMMAND_NAME = "teamcity.signIn";
    public static readonly SIGNOUT_COMMAND_NAME = "teamcity.signOut";
    public static readonly FIND_SUITABLE_CONFIGS_COMMAND_NAME = "teamcity.findSuitableBuildConfigurations";
    public static readonly REFRESH_SUITABLE_CONFIGS_COMMAND_NAME = "teamcity.refreshSuitableBuildConfigurations";
    public static readonly SELECT_FILES_COMMAND_NAME = "teamcity.selectFilesForRemoteRun";
    public static readonly REFRESH_SELECTED_FILES_COMMAND_NAME = "teamcity.refreshSelectedFilesForRemoteRun";
    public static readonly SHOW_OUTPUT_COMMAND_NAME = "teamcity.showOutput";
    public static readonly CHANGE_CONFIG_STATE = "changeConfigState";
    public static readonly CHANGE_COLLAPSIBLE_STATE = "changeCollapsibleState";
    public static readonly REMOTE_RUN_WITH_CONFIGS_COMMAND_NAME = "teamcity.remoteRun";
    public static readonly BACK_TO_EMPTY_DATA_PROVIDER_COMMAND_NAME = "teamcity.backToEmptyDataProvider";
    public static readonly BACK_TO_SELECT_FILES_COMMAND_NAME = "teamcity.backToSelectFilesForRemoteRun";
    public static readonly SHOW_MY_CHANGES_COMMAND_NAME = "teamcity.showMyChanges";
    public static readonly ROOT_PROJECT_ID = "_Root";
    public static readonly TARGET_NAME_SEPARATOR = "|";
}

/**
 * Without <any> in front of Tracker Event Type prefix ts won't compile the code.
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

export enum CvsFileStatusCode {
    MODIFIED = <any>"M",
    ADDED = <any>"A",
    DELETED = <any>"D",
    RENAMED = <any>"R"
}

export enum LoggingLevel {
    Error = 0,
    Warn = 1,
    Info = 2,
    Verbose = 3,
    Debug = 4
}

export enum MessageTypes {
    Error = 0,
    Warn = 1,
    Info = 2
}

export const TYPES = {
    Settings: Symbol("Settings"),
    CredentialsStore: Symbol("CredentialsStore"),
    ExtensionManager: Symbol("ExtensionManager"),
    CommandHolder: Symbol("CommandHolder"),
    NotificationWatcher: Symbol("NotificationWatcher"),
    RemoteLogin: Symbol("RemoteLogin"),
    RemoteBuildServer: Symbol("RemoteBuildServer"),
    WebLinks: Symbol("WebLinks"),
    PatchSender: Symbol("PatchSender"),
    SummaryDao: Symbol("SummaryDao"),
    BuildDao: Symbol("BuildDao"),
    Output: Symbol("Output"),
    PatchManager: Symbol("PatchManager"),
    XmlParser: Symbol("XmlParser"),
    GitProvider: Symbol("GitProvider"),
    TfvcProvider: Symbol("TfvcProvider"),
    CvsProviderFactory: Symbol("CvsProviderFactory"),
    CvsProviderProxy: Symbol("CvsProviderProxy"),
    SignIn: Symbol("SignIn"),
    SignOut: Symbol("SignOut"),
    SelectFilesForRemoteRun: Symbol("SelectFilesForRemoteRun"),
    GetSuitableConfigs: Symbol("GetSuitableConfigs"),
    RemoteRun: Symbol("RemoteRun"),
    PersistentStorageManager: Symbol("PersistentStorageManager"),
    WinPersistentCredentialsStore: Symbol("WinPersistentCredentialsStore"),
    WindowsCredentialStoreApi: Symbol("WindowsCredentialStoreApi"),
    OsxKeychainApi: Symbol("OsxKeychainApi"),
    FileTokenStorage: Symbol("FileTokenStorage"),
    OsProxy: Symbol("OsProxy"),
    FsProxy: Symbol("FsProxy"),
    PathProxy: Symbol("PathProxy"),
    CpProxy: Symbol("CpProxy"),
    OsxKeychain: Symbol("OsxKeychain"),
    ProviderManager: Symbol("ProviderManager"),
    ResourceProvider: Symbol("ResourceProvider"),
    BuildProvider: Symbol("BuildProvider"),
    LinuxFileApi: Symbol("LinuxFileApi"),
    WinCredStoreParsingStreamWrapper: Symbol("WinCredStoreParsingStreamWrapper"),
    OsxSecurityParsingStreamWrapper: Symbol("OsxSecurityParsingStreamWrapper"),
    VsCodeUtils: Symbol("VsCodeUtils"),
    TeamCityStatusBarItem: Symbol("TeamCityStatusBarItem"),
    WorkspaceProxy: Symbol("WorkspaceProxy"),
    ShowMyChangesCommand: Symbol("ShowMyChangesCommand"),
    ChangesProvider: Symbol("ChangesProvider"),
    WindowProxy: Symbol("WindowProxy"),
    RequestProxy: Symbol("RequestProxy"),
    MessageManager: Symbol("MessageManager"),
    WebLinkListener: Symbol("WebLinkListener")
};

export enum CvsOperation {
    DoNothing = "No, thank you.",
    DoCommitChanges = "Commit changes",
    DoCommitAndPushChanges = "Commit and Push (if possible) changes"
}

export enum DataProviderEnum {
    EmptyDataProvider = "EmptyDataProvider",
    ResourcesProvider = "ResourcesProvider",
    BuildsProvider = "BuildsProvider",
    ChangesProvider = "ChangesProvider"
}

export enum TimePeriodEnum {
    Today = "Today",
    Yesterday = "Yesterday",
    Older = "Older"
}

export enum UserChangeStatus {
    CHECKED = "Checked", //all configurations are checked successfully
    FAILED = "Failed",  // at least one configuration with the change has failed status
    CANCELED = "Canceled", // for personal only. at least one build canceled
    PENDING = "Pending", //at least one configuration has not bean run yet (no failed and no canceled)
    RUNNING_SUCCESSFULY = "Running successfully", //there are no failed, pending and canceled and there is at least one running
    RUNNING_FAILED = "Running failed"//there are no pending and canceled, but there is at least one failed and there is at least one running
}
