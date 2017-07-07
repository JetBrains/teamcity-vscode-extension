"use struct";

export class Strings {
    static PROVIDE_USERNAME : string = "Provide the username for TeamCity server.";
    static PROVIDE_PASSWORD : string = "Provide the password for username.";
    static PROVIDE_URL : string = "Provide the URL for TeamCity server.";
    static NO_CREDENTIALS_RUN_SIGNIN : string = "You are not connected to a TeamCity server. Please run the 'teamcity Signin' command."
    static SUCCESSFULLY_SIGNEDIN : string = "You are successfully signed in to the TeamCity server."
    static STATUS_CODE_401 : string = "Unauthorized. Check your authentication credentials and try again.";
    static UNEXPECTED_EXCEPTION : string = "Something went wrong. Please try again or write to support.";
}