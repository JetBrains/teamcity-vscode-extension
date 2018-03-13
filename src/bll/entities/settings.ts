export interface Settings {
    loggingLevel: string;
    showSignInWelcome: boolean;
    lastLogin: string;

    shouldAskStoreCredentials(): boolean;

    setShouldAskStoreCredentials(newValue: boolean): Promise<void>;
}
