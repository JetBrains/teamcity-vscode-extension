"use strict";

import { window, SourceControlInputBox, scm, QuickDiffProvider, WorkspaceEdit, workspace, extensions, SourceControlResourceState} from "vscode";
import { ExtensionManager } from "./extensionmanager";
import { Strings } from "./utils/strings";
import { Credential } from "./credentialstore/credential";
import { VsCodeUtils } from "./utils/vscodeutils";
import { CvsProvider } from "./utils/constants";
import { TCApiProvider, TCXmlRpcApiProvider } from "./teamcityapi/tcapiprovider";
import { PatchSender, TccPatchSender } from "./remoterun/patchsender";
import { CvsSupportProvider } from "./remoterun/cvsprovider";
import { CvsSupportProviderFactory } from "./remoterun/cvsproviderfactory";
import { BuildConfig } from "./remoterun/configexplorer";

import XHR = require("xmlhttprequest");
import XML2JS = require("xml2js");
import xmlrpc = require("xmlrpc");
import forge = require('node-forge');

export class CommandHolder {
    private _extManager : ExtensionManager;
    public constructor(extManager : ExtensionManager) {
        this._extManager = extManager;
    }

    public async signIn() {
        const defaultURL : string = this.getDefaultURL();
        const defaultUsername : string = this.getDefaultUsername();
        let url: string = await window.showInputBox( { value: defaultURL || "", prompt: Strings.PROVIDE_URL, placeHolder: "", password: false } );
        //we should prevent exception in case of slash in the end ("localhost:80/). url should be contained without it" 
        if (url != undefined && url.length !== 0) {
            url = url.replace(/\/$/, "");
        }
        let user: string = await window.showInputBox( { value: this.getDefaultUsername() || "", prompt: Strings.PROVIDE_USERNAME + " ( URL: " + url + ")", placeHolder: "", password: false });
        if (user === undefined || user.length <= 0) {
            user = defaultUsername;
        }
        const pass = await window.showInputBox( { prompt: Strings.PROVIDE_PASSWORD + " ( username: " + user + ")", placeHolder: "", password: true } );
        const creds : Credential = new Credential(url, user, pass);
        await this._extManager.credentialStore.setCredential(creds);  
    }
    
    public async remoteRun() {
        const cred : Credential = await this.tryGetCredentials();
        if (cred == undefined) {
            return;
        }
        const apiProvider : TCApiProvider = new TCXmlRpcApiProvider();

        const cvsProvider : CvsSupportProvider = await CvsSupportProviderFactory.getCvsSupportProvider();
        
        const tcFormatedFilePaths : string[] = await cvsProvider.getFormattedFilenames();
        const configs : BuildConfig[] = await apiProvider.getSuitableBuildConfig(tcFormatedFilePaths, cred);
        VsCodeUtils.showInfoMessage("Please specify builds for remote run.");
        
        this._extManager.configExplorer.setConfigs(configs);
        this._extManager.configExplorer.refresh();
    }

    public async remoteRunWithChosenConfigs() {
        const cred : Credential = await this.tryGetCredentials();
        if (cred == undefined) {
            return;
        }

        const inclConfigs : BuildConfig[] = this._extManager.configExplorer.getInclBuilds();
        if (inclConfigs === undefined || inclConfigs.length === 0) {
            VsCodeUtils.displayNoSelectedConfigsMessage();
            return;
        }
        this._extManager.configExplorer.setConfigs([]);
        this._extManager.configExplorer.refresh();

        const patchSender : PatchSender = new TccPatchSender();
        patchSender.remoteRun(cred, inclConfigs);
    }

    private getDefaultURL() : string {
        return "http://localhost";
    }

    private getDefaultUsername() : string {
        return "teamcity";
    }

    public moveToSecondProvider(config : BuildConfig) {
        config.changeState();
        this._extManager.configExplorer.refresh();
    }

    public async signOut() : Promise<void> {
        let res : CvsProvider = await VsCodeUtils.getActiveScm(); 
        console.log(res);
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