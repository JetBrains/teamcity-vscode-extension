export interface Settings {
    loggingLevel: string;

    /**
     * showSignInWelcome field has only a getter
     * To change this value use setShowSignInWelcome method
     */
    showSignInWelcome: boolean;
    shouldAskStoreCredentials(): boolean;
    setShowSignInWelcome(newValue: boolean): Promise<void>;
    setShowStoreCredentialsSuggestion(newValue: boolean): Promise<void>;
}
