export class MessageConstants {
    static readonly PROVIDE_USERNAME: string = "Provide the username for the TeamCity server.";
    static readonly PROVIDE_PASSWORD: string = "Provide the password for the username.";
    static readonly PROVIDE_URL: string = "Provide the URL for the TeamCity server.";
    static readonly URL_NOT_REACHABLE: string = "The TeamCity server cannot be reached.";
    static readonly PROVIDE_MESSAGE_FOR_REMOTE_RUN: string = "Provide the message for Remote Run.";
    static readonly PROVIDE_MESSAGE_FOR_COMMIT: string = "Provide the commit message.";
    static readonly NO_CREDENTIALS_RUN_SIGNIN: string = "You are not connected to the TeamCity server. Run the 'teamcity SignIn' command.";
    static readonly NO_CONFIGS_RUN_REMOTERUN: string = "No build configurations are selected for Remote run. Execute the 'Find Suitable Builds' command first";
    static readonly STATUS_CODE_401: string = "Unauthorized. Check your authentication credentials and try again.";
    static readonly XMLRPC_AUTH_EXCEPTION: string = "Unexpected exception during xmlrpc authentication";
    static readonly PLEASE_SPECIFY_BUILDS: string = "Specify build configurations for remote run.";
    static readonly DO_NOT_SHOW_AGAIN = "Don't show again";
    static readonly DO_NOT_ASK_AGAIN = "Don't ask again";
    static readonly WELCOME_MESSAGE = "You are successfully logged in. Welcome to the TeamCity extension!";
    static readonly SAVE_CREDENTIALS_SUGGESTION = "Do you want Visual Studio Code to save the TeamCity URL and your credentials?";
    static readonly UPDATE_CREDENTIALS_SUGGESTION = "Do you want Visual Studio Code to update the TeamCity URL and your credentials?";
    static readonly GIT_PATH_IS_NOT_FOUND = "Git path is not found!";
    static readonly REQUEST_FOR_NEXT_OPERATION = "Your personal build has finished successfully. Commit/push your changes?";
    static readonly SUITABLE_BUILDS_NOT_FOUND = "Suitable build configurations with non-manual VCS checkout mode in " +
        "where you have permissions to run builds were not found for the specified changes.";
    static readonly MANDATORY_FIELD: string = "This field is mandatory.";
    static readonly NO_CHANGED_FILES_CHOSEN: string = "Choose at least one changed file.";
}
