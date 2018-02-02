"use strict";

export class MessageConstants {
    static readonly PROVIDE_USERNAME: string = "Provide the username for TeamCity server.";
    static readonly PROVIDE_PASSWORD: string = "Provide the password for username.";
    static readonly PROVIDE_URL: string = "Provide the URL for TeamCity server.";
    static readonly PROVIDE_MESSAGE_FOR_REMOTE_RUN: string = "Provide the message for Remote Run.";
    static readonly PROVIDE_MESSAGE_FOR_COMMIT: string = "Provide the commit message.";
    static readonly NO_CREDENTIALS_RUN_SIGNIN: string = "You are not connected to a TeamCity server. Please run the 'teamcity SignIn' command.";
    static readonly NO_CONFIGS_RUN_REMOTERUN: string = "no selected build configs. Try to execute the 'Find Suitable Builds' command first";
    static readonly NO_TCC_UTIL: string = "Not found tcc.jar. Please reinstall teamcity extension.";
    static readonly SUCCESSFULLY_SIGNEDIN: string = "You are successfully signed in to the TeamCity server.";
    static readonly STATUS_CODE_401: string = "Unauthorized. Check your authentication credentials and try again.";
    static readonly UNEXPECTED_EXCEPTION: string = "Something went wrong. Please try again or write to support.";
    static readonly RCA_PUBLIC_KEY_EXCEPTION: string = "Unexpected exception during getting RCA public key.";
    static readonly XMLRPC_AUTH_EXCEPTION: string = "Unexpected exception during xmlrpc authentication";
    static readonly GET_SUITABLE_CONFIG_EXCEPTION: string = "Unexpected exception during getting suitable configurations";
    static readonly GET_BUILDS_EXCEPTION: string = "Unexpected exception during getting builds";
    static readonly PLEASE_SPECIFY_BUILDS: string = "Please specify builds for remote run.";
    static readonly DO_NOT_SHOW_AGAIN = "Don't show again";
    static readonly WELCOME_MESSAGE = "You are successfully logged in. Welcome to the TeamCity extension!";
    static readonly STORE_CREDENTIALS_SUGGESTION = "Do you want the IDE to save the TeamCity URL and your credentials?";
    static readonly GIT_PATH_IS_NOT_FOUND = "Git path is not found!";
    static readonly USER_ABORTED_THE_OPERATION = "User aborted the operation.";
    static readonly REQUEST_FOR_NEXT_OPERATION = "Personal Build has finished successfully. Whould you like to commit/push your changes?";
}
