"use struct";

import { window } from "vscode";
import { ExtensionManager } from "./extensionmanager";
import { Strings } from "./utils/strings";
import { Credential } from "./credentialstore/credential";
import { VsCodeUtils } from "./utils/vscodeutils";

import XHR = require("xmlhttprequest");
import XML2JS = require("xml2js");

export class CommandHolder{
    private _extManager : ExtensionManager;

    public constructor(extManager : ExtensionManager) {
        this._extManager = extManager;
    }

    public async signIn() {
        const defaultURL : string = this.getDefaultURL();
        const defaultUsername : string = this.getDefaultUsername();
        const defaultPassword: string = "";
        const url: string = await window.showInputBox({ value: defaultURL || "", prompt: Strings.PROVIDE_URL, placeHolder: "", password: false });
        const username: string = await window.showInputBox({ value: defaultUsername || "", prompt: Strings.PROVIDE_USERNAME + " ( URL: " + url + ")", placeHolder: "", password: false });
        if (username !== undefined && username.length > 0) {
            const password = await window.showInputBox({ value: defaultPassword, prompt: Strings.PROVIDE_PASSWORD + " ( username: " + username + ")", placeHolder: "", password: true });
            this._extManager.credentialStore.setCredential(url, username, password);
            try {
                this.testConnection();
            }catch (error) {
                console.error(error);
            }
        }
    }

    private getDefaultURL() : string {
        return "http://localhost";
    }

    private getDefaultUsername() : string {
        return "teamcity";
    }

    //TODO: move request creation to another method
    private testConnection() {
        this._extManager.credentialStore.getCredential().then(async (credential: Credential) => {
            if (!credential) {
                this.displayNoCredentialsMessage();
                return;
            } else {
                const XMLHttpRequest = XHR.XMLHttpRequest;
                const request : XHR.XMLHttpRequest = new XMLHttpRequest();
                const url = credential.serverURL + "/app/rest/";
                request.open("GET", url, true);
                request.setRequestHeader("Authorization", "Basic " + new Buffer(credential.username + ":" + credential.password).toString("base64"));
                request.send(null);
                request.onreadystatechange = function() {
                    if (request.readyState === request.DONE) {
                        if (request.status === 200){
                            VsCodeUtils.ShowInfoMessage(Strings.SUCCESSFULLY_SIGNEDIN);
                        }else if (request.status === 401){
                            VsCodeUtils.ShowErrorMessage(Strings.STATUS_CODE_401);
                        }else{
                            VsCodeUtils.ShowErrorMessage(Strings.UNEXPECTED_EXCEPTION);
                        }
                    }
                }
            }
        });
    }

    private listUserProjects() {
        this._extManager.credentialStore.getCredential().then(async (credential: Credential) => {
                    if (!credential) {
                        this.displayNoCredentialsMessage();
                        return;
                    } else {
                        const XMLHttpRequest = XHR.XMLHttpRequest;
                        const request : XHR.XMLHttpRequest = new XMLHttpRequest();
                        const url = credential.serverURL + "/app/rest/projects";
                        request.open("GET", url, true);
                        request.setRequestHeader("Authorization", "Basic " + new Buffer(credential.username + ":" + credential.password).toString("base64"));
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
        });
    }

    private displayNoCredentialsMessage(): void {
        let displayError: string = Strings.NO_CREDENTIALS_RUN_SIGNIN;
        VsCodeUtils.ShowErrorMessage(displayError);
    }
    
    public signOut() : void {
        this._extManager.cleanUp();
    }

}