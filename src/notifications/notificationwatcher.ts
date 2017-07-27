"use strict";
import { TCApiProvider, TCXmlRpcApiProvider } from "../teamcityapi/tcapiprovider";
import { CredentialStore } from "../credentialstore/credentialstore";
import { Credential } from "../credentialstore/credential";

export class NotificationWatcher {
    private readonly _credentialStore : CredentialStore;
    private readonly CHECK_FREQUENCY_MS : number = 25000;
    constructor (credentialStore : CredentialStore) {
        this._credentialStore = credentialStore;
    }

    /**
     * This method activates Notification Watcher. Since user is signed in, it will check if eventCounter is changed.
     * Frequency of requests on server is settled by CHECK_FREQUENCY_MS.
     */
    public async start() {
        const apiProvider : TCApiProvider = new TCXmlRpcApiProvider();
        let prevEventCounter : number;
        while (true) {
            await this.sleep(this.CHECK_FREQUENCY_MS);
            const cred : Credential = this._credentialStore.getCredential();
            if (!cred) { continue; }

            const eventCounter : number = await apiProvider.getTotalNumberOfEvents(cred);
            if (eventCounter === prevEventCounter) { continue; }

            console.log("We should process new notifications.");
            prevEventCounter = eventCounter;
        }
    }

    private sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
