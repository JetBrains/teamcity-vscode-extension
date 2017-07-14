"use struct";

import { Credential } from "./credential";
import { VsCodeUtils } from "../utils/vscodeutils";
import { Strings } from "../utils/strings";
import { Constants } from "../utils/constants";

import XHR = require("xmlhttprequest");

export class CredentialStore{
    private _creds : Credential;

    public async setCredential(creds : Credential) : Promise<void> {
        // Should credential is not undefined, it will be updated
        const checkResult = await this.checkCredential(creds);
        if (checkResult){
            this._creds = creds;
        }
    }

    public getCredential() : Credential {
        return this._creds;
    }

    public async removeCredential() : Promise<void> {
        this._creds = undefined;
    }

        //TODO: move request creation to another method
    private async checkCredential(creds : Credential) {
        return new Promise((resolve, reject) => {
            if (!creds) {
                VsCodeUtils.displayNoCredentialsMessage();
                resolve(false);
            }
            const XMLHttpRequest = XHR.XMLHttpRequest;
            const request : XHR.XMLHttpRequest = new XMLHttpRequest();
            const url = creds.serverURL + "/app/rest/";
            request.open("GET", url, true);
            request.setRequestHeader("Authorization", "Basic " + new Buffer(creds.user + ":" + creds.pass).toString("base64"));
            request.send();
            request.onreadystatechange = function(){
                if (request.readyState !== request.DONE) {
                    return;
                }
                if (request.status === Constants.HTTP_STATUS_OK){
                    VsCodeUtils.showInfoMessage(Strings.SUCCESSFULLY_SIGNEDIN);
                    resolve(true);
                }else if (request.status === Constants.HTTP_STATUS_UNAUTHORIZED){
                    VsCodeUtils.showErrorMessage(Strings.STATUS_CODE_401);  
                    resolve(false);     
                }else{
                    VsCodeUtils.showErrorMessage(Strings.UNEXPECTED_EXCEPTION);              
                    resolve(false);                              
                }
            }
        });
    }
}