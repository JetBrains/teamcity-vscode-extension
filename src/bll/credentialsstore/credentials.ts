export class Credentials {
    public readonly serverURL: string;
    public readonly user: string;
    public readonly password: string;
    public readonly userId: string;
    public readonly sessionId: string;

    public constructor(serverURL, user, password, userId, sessionId) {
        this.serverURL = serverURL;
        this.user = user;
        this.password = password;
        this.userId = userId;
        this.sessionId = sessionId;
    }

    public equals(credentials: Credentials): boolean {
        return !(credentials === undefined ||
            this.user !== credentials.user ||
            this.serverURL !== credentials.serverURL ||
            this.password !== credentials.password);
    }
}
