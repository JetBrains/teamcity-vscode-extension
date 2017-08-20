"use strict";

export class Credentials {
    private _serverURL: string;
    private _user: string;
    private _password: string;
    private _userId: string;
    private _sessionId: string;

    public constructor(_serverURL, _user, _password, userId, sessionId) {
        this._serverURL = _serverURL;
        this._user = _user;
        this._password = _password;
        this._userId = userId;
        this._sessionId = sessionId;
    }

    public get serverURL(): string {
        return this._serverURL;
    }

    public get user(): string {
        return this._user;
    }

    public get password(): string {
        return this._password;
    }

    public get userId(): string {
        return this._userId;
    }

    public get sessionId(): string {
        return this._sessionId;
    }
}
