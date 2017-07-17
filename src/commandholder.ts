"use struct";

import { window, SourceControlInputBox, scm, QuickDiffProvider, WorkspaceEdit, workspace, extensions, SourceControlResourceState} from "vscode";
import { ExtensionManager } from "./extensionmanager";
import { Strings } from "./utils/strings";
import { Credential } from "./credentialstore/credential";
import { VsCodeUtils } from "./utils/vscodeutils";
import { FileController } from "./utils/filecontroller";
import { BuildConfigResolver, XmlRpcBuildConfigResolver } from "./remoterun/buildconfigresolver";
import { PatchSender, TccPatchSender } from "./remoterun/patchsender";
import { CvsSupportProvider, GitSupportProvider } from "./remoterun/cvssupportprovider";
import { BuildConfig } from "./remoterun/configexplorer";


import XHR = require("xmlhttprequest");
import XML2JS = require("xml2js");
import xmlrpc = require("xmlrpc");
import forge = require('node-forge');

import * as cp from "child_process";  
import * as path from "path";
import * as fs from "fs";

export class CommandHolder{
    private _extManager : ExtensionManager;
    public constructor(extManager : ExtensionManager) {
        this._extManager = extManager;
    }

    public async signIn() {
        const defaultURL : string = this.getDefaultURL();
        const defaultUsername : string = this.getDefaultUsername();
        let url: string = await window.showInputBox({ value: defaultURL || "", prompt: Strings.PROVIDE_URL, placeHolder: "", password: false });
        //we should prevent exception in case of slash in the end ("localhost:80/). url should be contained without it" 
        if (url != undefined && url.length !== 0){
            url = url.replace(/\/$/, "");
        }
        let user: string = await window.showInputBox({ value: defaultUsername || "", prompt: Strings.PROVIDE_USERNAME + " ( URL: " + url + ")", placeHolder: "", password: false });
        if (user === undefined || user.length <= 0) {
            user = defaultUsername;
        }
        const pass = await window.showInputBox({ prompt: Strings.PROVIDE_PASSWORD + " ( username: " + user + ")", placeHolder: "", password: true });
        const creds : Credential = new Credential(url, user, pass);
        await this._extManager.credentialStore.setCredential(creds);  
    }
    
    public async remoteRun(){
        const cred : Credential = await this.tryGetCreds();
        if (cred == undefined) {
            return;
        }
        const confResolver : BuildConfigResolver = new XmlRpcBuildConfigResolver(cred);
        const api = extensions.getExtension("vscode.git").exports;
        const changedFiles = api.getResources();
        const cvsProvider : CvsSupportProvider = new GitSupportProvider();
        
        const args : string[] = await cvsProvider.formatChangedFilenames(changedFiles);
        
        const configs : BuildConfig[] = await confResolver.getSuitableBuildConfig(args);
        VsCodeUtils.showInfoMessage("Please specify builds for remote run.");
        
        this._extManager.сonfigExplorer.setConfigs(configs);
        this._extManager.сonfigExplorer.refresh();
    }

    public async remoteRunWithChosenConfigs(){
        const cred : Credential = await this.tryGetCreds();
        if (cred == undefined) {
            return;
        }

        const inclConfigs : BuildConfig[] = this._extManager.сonfigExplorer.getInclBuilds();
        if (inclConfigs === undefined || inclConfigs.length === 0){
            VsCodeUtils.displayNoSelectedConfigsMessage();
            return;
        }
        this._extManager.сonfigExplorer.setConfigs([]);
        this._extManager.сonfigExplorer.refresh();

        const patchSender : PatchSender = new TccPatchSender();
        const api = extensions.getExtension("vscode.git").exports;
        const changedFiles : SourceControlResourceState[] = api.getResources();//TODO: change api!
        const commitMessage : string = scm.inputBox.value;
        patchSender.remoteRun(cred, inclConfigs, changedFiles, commitMessage);
    }

    private getDefaultURL() : string {
        return "http://localhost";
    }

    private getDefaultUsername() : string {
        return "teamcity";
    }

    private listUserProjects() {
        const cred : Credential = this._extManager.credentialStore.getCredential();
        if (!cred) {
            VsCodeUtils.displayNoCredentialsMessage();
            return;
        } 
        const XMLHttpRequest = XHR.XMLHttpRequest;
        const request : XHR.XMLHttpRequest = new XMLHttpRequest();
        const url = cred.serverURL + "/app/rest/projects";
        request.open("GET", url, true);
        request.setRequestHeader("Authorization", "Basic " + new Buffer(cred.user + ":" + cred.pass).toString("base64"));
        request.send(null);
        request.onreadystatechange = function() {
            if (request.readyState === request.DONE) {
                let projects;
                const parseString = XML2JS.parseString;
                parseString(request.responseText, function (err, result) {
                    projects = result.projects.project;
                    if (err) {
                        console.error(err);
                    }
                });
                if (projects){
                    console.log("List of projects: ");
                    for (let i = 0; i < projects.length; i++ ) {
                        const project = projects[i];
                        console.log(i + ": " + project.$.name);
                    }
                }
            }
        };
    }

    public moveToSecondProvider(config : BuildConfig){
        config.changeState();
        this._extManager.сonfigExplorer.refresh();
    }

    public async signOut() : Promise<void> {
        this._extManager.cleanUp();
    }

    public async tryGetCreds() : Promise<Credential> {
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