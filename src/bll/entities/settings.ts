"use strict";

import {workspace, ExtensionContext, Memento} from "vscode";

export interface Settings {
    loggingLevel: string;

    /**
     * showSignInWelcome field has only a getter
     * To change this value use setShowSignInWelcome method
     */
    showSignInWelcome: boolean;
    getLastUrl(): string;
    getLastUsername(): string;
    shouldStoreCredentials(): boolean;
    setLastUrl(url: string): Promise<void>;
    setLastUsername(username: string): Promise<void>;
    setShowSignInWelcome(newValue: boolean): Promise<void>;
}
