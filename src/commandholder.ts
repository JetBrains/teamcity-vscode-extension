"use struct";

import { window, SourceControlInputBox, scm, QuickDiffProvider, WorkspaceEdit, workspace, extensions} from "vscode";
import { ExtensionManager } from "./extensionmanager";
import { Strings } from "./utils/strings";
import { Credential } from "./credentialstore/credential";
import { VsCodeUtils } from "./utils/vscodeutils";
import { BuildConfigResolver, XmlRpcBuildConfigResolver } from "./buildconfigresolver";
import { CvsSupportProvider, GitSupportProvider } from "./cvssupportprovider";

import XHR = require("xmlhttprequest");
import XML2JS = require("xml2js");
import xmlrpc = require("xmlrpc");
import forge = require('node-forge');
                    
export class CommandHolder{
    private _extManager : ExtensionManager;
    public constructor(extManager : ExtensionManager) {
        this._extManager = extManager;
    }

    public async signIn() {
        const defaultURL : string = this.getDefaultURL();
        const defaultUsername : string = this.getDefaultUsername();
        const url: string = await window.showInputBox({ value: defaultURL || "", prompt: Strings.PROVIDE_URL, placeHolder: "", password: false });
        let user: string = await window.showInputBox({ value: defaultUsername || "", prompt: Strings.PROVIDE_USERNAME + " ( URL: " + url + ")", placeHolder: "", password: false });
        if (user === undefined || user.length <= 0) {
            user = defaultUsername;
        }
        const pass = await window.showInputBox({ prompt: Strings.PROVIDE_PASSWORD + " ( username: " + user + ")", placeHolder: "", password: true });
        const creds : Credential = new Credential(url, user, pass);
        this._extManager.credentialStore.setCredential(creds);  
    }
    
    public async remoteRun(){
        const cred : Credential = this._extManager.credentialStore.getCredential();
        if (!cred) {
            VsCodeUtils.displayNoCredentialsMessage();
            return;
        }
        const confResolver : BuildConfigResolver = new XmlRpcBuildConfigResolver(cred);
        const api = extensions.getExtension("vscode.git").exports;
        const changedFiles = api.getResources();
        const cvsProvider : CvsSupportProvider = new GitSupportProvider();
        
        const args : string[] = await cvsProvider.formatChangedFilenames(changedFiles);
        const conf : string[] = await confResolver.getSuitableBuildConfig(args);
        window.showQuickPick(conf);
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

    private _xmlRpcClient = undefined;
    public async signOut() : Promise<void> {
        const config = workspace.getConfiguration('git');
        this._extManager.cleanUp();
    }
    


}