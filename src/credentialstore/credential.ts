"use strict";

export class Credential {
    private _serverURL : string;
    private _user : string;
    private _pass : string;
    public userId : string;

    public constructor(_serverURL, _user, _pass) {
        this._serverURL = _serverURL;
        this._user = _user;
        this._pass = _pass;
    }

    public get serverURL() : string {
        return this._serverURL;
    }

    public get user() : string {
        return this._user;
    }

    public get pass() : string {
        return this._pass;
    }
}
