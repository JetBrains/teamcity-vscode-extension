"use struct";

export class Credential{
    private _serverURL : string;
    private _username : string;
    private _password : string;

    public constructor(_serverURL, _username, _password){
        this._serverURL = _serverURL;
        this._username = _username;
        this._password = _password;
    }

    public get serverURL() : string{
        return this._serverURL;
    }
    
    public get username() : string{
        return this._username;
    }

    public get password() : string{
        return this._password;
    }
}