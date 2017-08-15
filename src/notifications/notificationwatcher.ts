"use strict";

import { OutputChannel } from "vscode";
import { Logger } from "../utils/logger";
import { VsCodeUtils } from "../utils/vscodeutils";
import { Credential } from "../credentialstore/credential";
import { CredentialStore } from "../credentialstore/credentialstore";
import { SummaryDataProxy, ChangeItemProxy } from "../entities/summarydata";
import { TCApiProvider, TCXmlRpcApiProvider } from "../teamcityapi/tcapiprovider";

export class NotificationWatcher {
    private readonly _credentialStore : CredentialStore;
    private readonly CHECK_FREQUENCY_MS : number = 10000;
    private readonly outdatedChangeIds : string[] = [];
    private readonly outdatedPersonalChangeIds : string[] = [];
    private readonly _outputChannal : OutputChannel;
    private isActive = false;

    constructor (credentialStore : CredentialStore, outputChannal : OutputChannel) {
        this._credentialStore = credentialStore;
        this._outputChannal = outputChannal;
        Logger.logDebug("Credential Store was initialized");
    }

    /**
     * This method activates Notification Watcher. Since user is signed in, it will check if eventCounter is changed.
     * Frequency of requests on server is settled by CHECK_FREQUENCY_MS.
     */
    public async activate() {
        const apiProvider : TCApiProvider = new TCXmlRpcApiProvider();
        this.isActive = true;
        const cred : Credential = this._credentialStore.getCredential();
        if (!cred) {
            Logger.logWarning("NotificationWatcher#activate: User Credentials absent");
            return;
        }
        let prevEventCounter : number = await apiProvider.getTotalNumberOfEvents(cred);
        const summary : SummaryDataProxy = await apiProvider.getSummary(cred);
        //filling outdatedChangeIds and outdatedPersonalChangeIds arrays
        this.collectNewChanges(summary.changes);
        this.collectNewChanges(summary.personalChanges);
        while (this.isActive && cred) {
            const eventCounter : number = await apiProvider.getTotalNumberOfEvents(cred);
            if (eventCounter === prevEventCounter) {
                await VsCodeUtils.sleep(this.CHECK_FREQUENCY_MS);
                continue;
            }
            Logger.logInfo("Notification Logger was changed. We should process new notifications.");
            const summary : SummaryDataProxy = await apiProvider.getSummary(cred);
            let changes : ChangeItemProxy[] = this.collectNewChanges(summary.changes);
            changes = changes.concat(this.collectNewChanges(summary.personalChanges));
            await this.displayChanges(changes);
            prevEventCounter = eventCounter;
            await VsCodeUtils.sleep(this.CHECK_FREQUENCY_MS);
        }
    }

    /**
     * This method resets all contained data.
     */
    public resetData() {
        this.isActive = false;
        this.outdatedChangeIds.length = 0;
        this.outdatedPersonalChangeIds.length = 0;
        Logger.logDebug("Notification Watcher data was reseted");
    }

    /**
     * This method works on the observation that changes in the summary are sorted and the first change in an array is the latest one.
     * @param changes - sorted array of personal or non-personal changes
     * @return - all new changes.
     */
    private collectNewChanges(changes : ChangeItemProxy[]) : ChangeItemProxy[] {
        const newChanges : ChangeItemProxy[] = [];
        for (let i = 0; i < changes.length; i++) {
            const correspondingArray = changes[i].isPersonal ? this.outdatedPersonalChangeIds : this.outdatedChangeIds;
            if (correspondingArray.indexOf(`${changes[i].changeId}:${changes[i].status}`) === -1) {
                newChanges.push(changes[i]);
                correspondingArray.push(`${changes[i].changeId}:${changes[i].status}`);
            } else {
                break;
            }
        }
        return newChanges;
    }

    /**
     * This method collect required info from change objects and display corresponding message into TeamCity output.
     * @param changes - change objects to display.
     */
    private async displayChanges(changes : ChangeItemProxy[]) {
        const cred : Credential = this._credentialStore.getCredential();
        if (!changes || !cred) {
            Logger.logWarning(`NotificationWatcher#displayChanges: changes or user credentials absent`);
            return;
        }
        changes.forEach((change) => {
            const message : string = VsCodeUtils.formMessage(change, cred);
            this._outputChannal.appendLine(message + "\n");
        });
    }
}
