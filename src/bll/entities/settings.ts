export interface Settings {
    loggingLevel: string;
    lastLogin: string;

    shouldAskStoreCredentials(): boolean;

    setShouldAskStoreCredentials(newValue: boolean): Promise<void>;

    shouldCollectGitChangesFromIndex(): boolean;

    isGitSupported(): boolean;

    isTfvcPreTestedSupported(): boolean;
}
