"use strict";

import { window, workspace, extensions, scm, SourceControlInputBox, QuickDiffProvider, } from "vscode";
import { WorkspaceEdit, SourceControlResourceState, OutputChannel, MessageItem, Disposable} from "vscode";
import { ExtensionManager } from "./extensionmanager";
import { Strings } from "./utils/strings";
import { Credential } from "./credentialstore/credential";
import { VsCodeUtils } from "./utils/vscodeutils";
import { TCApiProvider, TCXmlRpcApiProvider } from "./teamcityapi/tcapiprovider";
import { PatchSender, TccPatchSender } from "./remoterun/patchsender";
import { CvsSupportProvider } from "./remoterun/cvsprovider";
import { CustomPatchSender } from "./remoterun/custompatchsender";
import { Logger } from "./utils/logger";
import { CvsSupportProviderFactory } from "./remoterun/cvsproviderfactory";
import { ProjectItem, BuildConfigItem } from "./remoterun/configexplorer";
import XHR = require("xmlhttprequest");
import XML2JS = require("xml2js");
import xmlrpc = require("xmlrpc");
import forge = require("node-forge");

export class CommandHolder {
    private _extManager : ExtensionManager;
    private _cvsProvider : CvsSupportProvider;
    public constructor(extManager : ExtensionManager) {
        this._extManager = extManager;
    }

    public async signIn() {
        Logger.logInfo("CommandHolder#signIn: starts");
        let signedIn : boolean = false;
        let creds : Credential;
        //try getting credentials from keytar
        try {
            const keytar = require("keytar");
            Logger.logDebug(`CommandHolder#signIn: keytar is supported. Good job user.`);
            const url = await keytar.getPassword("teamcity", "serverurl");
            const user = await keytar.getPassword("teamcity", "username");
            const pass = await keytar.getPassword("teamcity", "password");
            creds = new Credential(url, user, pass);
            signedIn = creds ? await this._extManager.credentialStore.setCredential(creds) : false;
            Logger.logDebug(`CommandHolder#signIn: paswword was${signedIn ? "" : " not"} found at keytar.`);
        } catch (err) {
            Logger.logError(`CommandHolder#signIn: Unfortunately storing a password is not supported. The reason: ${VsCodeUtils.formatErrorMessage(err)}`);
        }

        if (!signedIn) {
            creds = await this.requestTypingCredentials();
            signedIn = creds ? await this._extManager.credentialStore.setCredential(creds) : false;
        }

        if (signedIn) {
            Logger.logInfo("CommandHolder#signIn: success");
            if (this._extManager.settings.showSignInWelcome) {
                this.showWelcomeMessage();
            }
            this.storeLastUserCreds(creds);
            this._extManager.notificationWatcher.activate();
        } else {
            Logger.logWarning("CommandHolder#signIn: failed");
        }
    }

    public async getSuitableConfigs() {
        Logger.logInfo("CommandHolder#getSuitableConfigs: starts");
        const cred : Credential = await this.tryGetCredentials();
        if (cred === undefined) {
            return;
        }
        const apiProvider : TCApiProvider = new TCXmlRpcApiProvider();
        this._cvsProvider = await CvsSupportProviderFactory.getCvsSupportProvider();
        if ( this._cvsProvider === undefined ) {
            return;
        }
        const tcFormatedFilePaths : string[] = await this._cvsProvider.getFormattedFilenames();
        const projects : ProjectItem[] = await apiProvider.getSuitableBuildConfigs(tcFormatedFilePaths, cred);
        VsCodeUtils.showInfoMessage("[TeamCity] Please specify builds for remote run.");
        this._extManager.configExplorer.setProjects(projects);
        this._extManager.configExplorer.refresh();
        Logger.logInfo("CommandHolder#getSuitableConfigs: finished");
    }

    public async remoteRunWithChosenConfigs() {
        Logger.logInfo("CommandHolder#remoteRunWithChosenConfigs: starts");
        const cred : Credential = await this.tryGetCredentials();
        if (!cred || !this._cvsProvider) {
            //TODO: think about the message in this case
            Logger.logWarning("CommandHolder#remoteRunWithChosenConfigs: credentials or cvsProvider absents. Try to sign in again");
            return;
        }
        const inclConfigs : BuildConfigItem[] = this._extManager.configExplorer.getInclBuilds();
        if (inclConfigs === undefined || inclConfigs.length === 0) {
            VsCodeUtils.displayNoSelectedConfigsMessage();
            Logger.logWarning("CommandHolder#remoteRunWithChosenConfigs: no selected build configs. Try to execute the 'Remote run' command");
            return;
        }
        this._extManager.configExplorer.setProjects([]);
        this._extManager.configExplorer.refresh();
        const patchSender : PatchSender = new CustomPatchSender(cred.serverURL);
        //const patchSender : PatchSender = new TccPatchSender();
        const remoteRunResult : boolean = await patchSender.remoteRun(cred, inclConfigs, this._cvsProvider);
        if (remoteRunResult) {
            Logger.logInfo("CommandHolder#remoteRunWithChosenConfigs: remote run is ok");
            this._cvsProvider.requestForPostCommit();
        } else {
            Logger.logWarning("CommandHolder#remoteRunWithChosenConfigs: something went wrong during remote run");
        }
        Logger.logInfo("CommandHolder#remoteRunWithChosenConfigs: finishes");
    }

    private getDefaultURL() : string {
        return this._extManager.settings.getLastUrl();
    }

    private getDefaultUsername() : string {
        return this._extManager.settings.getLastUsername();
    }

    public changeConfigState(config : BuildConfigItem) {
        config.changeState();
        this._extManager.configExplorer.refresh();
    }

    public changeCollapsibleState(project : ProjectItem) {
        project.changeCollapsibleState();
    }

    public async signOut() : Promise<void> {
        Logger.logInfo("CommandHolder#signOut: starts");
        this._extManager.cleanUp();
        Logger.logInfo("CommandHolder#signOut: finished");
    }

    public async tryGetCredentials() : Promise<Credential> {
        let cred : Credential = this._extManager.credentialStore.getCredential();
        if (!cred) {
            Logger.logInfo("CommandHolder#tryGetCredentials: credentials is undefined. An attempt to get them");
            await this.signIn();
            cred = this._extManager.credentialStore.getCredential();
            if (!cred) {
                VsCodeUtils.displayNoCredentialsMessage();
                Logger.logWarning("CommandHolder#tryGetCredentials: An attempt to get credentials failed");
                return undefined;
            }
        }
        Logger.logInfo("CommandHolder#tryGetCredentials: success");
        return cred;
    }

    private async showWelcomeMessage() {
        const DO_NOT_SHOW_AGAIN = "Don't show again";
        const WELCOME_MESSAGE = "You are successfully logged in. Welcome to the TeamCity extension!";
        const messageItems: MessageItem[] = [];
        messageItems.push({ title : DO_NOT_SHOW_AGAIN });
        const chosenItem: MessageItem = await VsCodeUtils.showInfoMessage(WELCOME_MESSAGE,  ...messageItems);
        if (chosenItem && chosenItem.title === DO_NOT_SHOW_AGAIN) {
            this._extManager.settings.setShowSignInWelcome(false);
        }
    }

    private async requestTypingCredentials() : Promise<Credential> {
        const defaultURL : string = this.getDefaultURL();
        const defaultUsername : string = this.getDefaultUsername();

        let url: string = await window.showInputBox( { value: defaultURL || "", prompt: Strings.PROVIDE_URL, placeHolder: "", password: false } );
        if (!url) {
            //It means that user clicked "Esc": abort the operation
            Logger.logDebug("CommandHolder#signIn: abort after url inputbox");
            return;
        } else {
            //to prevent exception in case of slash in the end ("localhost:80/). url should be contained without it"
            url = url.replace(/\/$/, "");
        }

        const user: string = await window.showInputBox( { value: defaultUsername || "", prompt: Strings.PROVIDE_USERNAME + " ( URL: " + url + " )", placeHolder: "", password: false });
        if (!user) {
            Logger.logDebug("CommandHolder#signIn: abort after username inputbox");
            //It means that user clicked "Esc": abort the operation
            return;
        }

        const pass = await window.showInputBox( { prompt: Strings.PROVIDE_PASSWORD + " ( username: " + user + " )", placeHolder: "", password: true } );
        if (!pass) {
            //It means that user clicked "Esc": abort the operation
            Logger.logDebug("CommandHolder#signIn: abort after password inputbox");
            return;
        }
        const creds : Credential = new Credential(url, user, pass);
        return creds;
    }

    private async storeLastUserCreds(creds : Credential) : Promise<void> {
        if (!creds) {
            return;
        }
        await this._extManager.settings.setLastUrl(creds.serverURL);
        await this._extManager.settings.setLastUsername(creds.user);
        try {
            const keytar = require("keytar");
            Logger.logDebug(`CommandHolder#storeLastUserCreds: keytar is supported. Good job user.`);
            keytar.setPassword("teamcity", "serverurl", creds.serverURL);
            keytar.setPassword("teamcity", "username", creds.user);
            keytar.setPassword("teamcity", "password", creds.pass);
        } catch (err) {
            Logger.logError(`CommandHolder#storeLastUserCreds: Unfortunately storing a password is not supported. The reason: ${VsCodeUtils.formatErrorMessage(err)}`);
        }
    }
}
