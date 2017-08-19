"use strict";

export class MessageConstants {
    static readonly PROVIDE_USERNAME: string = "Provide the username for TeamCity server.";
    static readonly PROVIDE_PASSWORD: string = "Provide the password for username.";
    static readonly PROVIDE_URL: string = "Provide the URL for TeamCity server.";
    static readonly NO_CREDENTIALS_RUN_SIGNIN: string = "You are not connected to a TeamCity server. Please run the 'teamcity SignIn' command.";
    static readonly NO_CONFIGS_RUN_REMOTERUN: string = "No selected build configs. Please execute the 'GitRemote run' command.";
    static readonly NO_TCC_UTIL: string = "Not found tcc.jar. Please reinstall teamcity extension.";
    static readonly SUCCESSFULLY_SIGNEDIN: string = "You are successfully signed in to the TeamCity server.";
    static readonly STATUS_CODE_401: string = "Unauthorized. Check your authentication credentials and try again.";
    static readonly UNEXPECTED_EXCEPTION: string = "Something went wrong. Please try again or write to support.";
    static readonly RCA_PUBLIC_KEY_EXCEPTION: string = "Unexpected exception during getting RCA public key.";
    static readonly XMLRPC_AUTH_EXCEPTION: string = "Unexpected exception during xmlrpc authentication";
    static readonly GET_SUITABLE_CONFIG_EXCEPTION: string = "Unexpected exception during getting suitable configurations";
    static readonly GET_BUILDS_EXCEPTION: string = "Unexpected exception during getting builds";
}
