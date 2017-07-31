"use strict";

import { window, SourceControlInputBox, Disposable, OutputChannel, scm, QuickDiffProvider, WorkspaceEdit, workspace, extensions, SourceControlResourceState} from "vscode";
import { ExtensionManager } from "./extensionmanager";
import { Strings } from "./utils/strings";
import { Credential } from "./credentialstore/credential";
import { VsCodeUtils } from "./utils/vscodeutils";
import { TCApiProvider, TCXmlRpcApiProvider } from "./teamcityapi/tcapiprovider";
import { PatchSender, TccPatchSender } from "./remoterun/patchsender";
import { CvsSupportProvider } from "./remoterun/cvsprovider";
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
        const defaultURL : string = this.getDefaultURL();
        const defaultUsername : string = this.getDefaultUsername();
        let url: string = await window.showInputBox( { value: defaultURL || "", prompt: Strings.PROVIDE_URL, placeHolder: "", password: false } );
        //we should prevent exception in case of slash in the end ("localhost:80/). url should be contained without it"
        if (url !== undefined && url.length !== 0) {
            url = url.replace(/\/$/, "");
        }
        let user: string = await window.showInputBox( { value: this.getDefaultUsername() || "", prompt: Strings.PROVIDE_USERNAME + " ( URL: " + url + ")", placeHolder: "", password: false });
        if (user === undefined || user.length <= 0) {
            user = defaultUsername;
        }
        const pass = await window.showInputBox( { prompt: Strings.PROVIDE_PASSWORD + " ( username: " + user + ")", placeHolder: "", password: true } );
        const creds : Credential = new Credential(url, user, pass);
        const signedIn : boolean = await this._extManager.credentialStore.setCredential(creds);
        if (signedIn) {
            this._extManager.notificationWatcher.activate();
        }
    }

    public async getSuitableConfigs() {
        const cred : Credential = await this.tryGetCredentials();
        if (cred === undefined) {
            return;
        }
        const apiProvider : TCApiProvider = new TCXmlRpcApiProvider();
        this._cvsProvider = await CvsSupportProviderFactory.getCvsSupportProvider();
        if ( this._cvsProvider === undefined ) {
            throw "There is no changes detected.";
        }
        const tcFormatedFilePaths : string[] = await this._cvsProvider.getFormattedFilenames();
        const projects : ProjectItem[] = await apiProvider.getSuitableBuildConfigs(tcFormatedFilePaths, cred);
        VsCodeUtils.showInfoMessage("[TeamCity] Please specify builds for remote run.");
        this._extManager.configExplorer.setProjects(projects);
        this._extManager.configExplorer.refresh();
    }

    public async remoteRunWithChosenConfigs() {
        const cred : Credential = await this.tryGetCredentials();
        if (!cred || !this._cvsProvider) {
            //TODO: think about the message in this case
            return;
        }
        const inclConfigs : BuildConfigItem[] = this._extManager.configExplorer.getInclBuilds();
        if (inclConfigs === undefined || inclConfigs.length === 0) {
            VsCodeUtils.displayNoSelectedConfigsMessage();
            return;
        }
        this._extManager.configExplorer.setProjects([]);
        this._extManager.configExplorer.refresh();
        const patchSender : PatchSender = new TccPatchSender();
        const remoteRunResult : boolean = await patchSender.remoteRun(cred, inclConfigs, this._cvsProvider);
        if (remoteRunResult) {
            const BUILD_RUN_SUCCESSFULLY : string = "[TeamCity] Build for your changes run successfully";
            VsCodeUtils.showInfoMessage(BUILD_RUN_SUCCESSFULLY);
            this._cvsProvider.requestForPostCommit();
        }
    }

    private getDefaultURL() : string {
        return "http://localhost";
    }

    private getDefaultUsername() : string {
        return "teamcity";
    }

    public changeConfigState(config : BuildConfigItem) {
        config.changeState();
        this._extManager.configExplorer.refresh();
    }

    public changeCollapsibleState(project : ProjectItem) {
        project.changeCollapsibleState();
    }

    public async signOut() : Promise<void> {
        this._extManager.cleanUp();
    }

    public async tryGetCredentials() : Promise<Credential> {
        let cred : Credential = this._extManager.credentialStore.getCredential();
        if (!cred) {
            await this.signIn();
            cred = this._extManager.credentialStore.getCredential();
            if (!cred) {
                VsCodeUtils.displayNoCredentialsMessage();
                return undefined;
            }
        }
        return cred;
    }
}
