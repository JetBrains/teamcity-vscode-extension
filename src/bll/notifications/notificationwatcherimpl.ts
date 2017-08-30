"use strict";

import {OutputChannel} from "vscode";
import {Logger} from "../utils/logger";
import {WebLinks} from "../../dal/weblinks";
import {XmlParser} from "../utils/xmlparser";
import {VsCodeUtils} from "../utils/vscodeutils";
import {TeamCityOutput} from "../../view/teamcityoutput";
import {BuildItemProxy} from "../entities/builditemproxy";
import {ChangeItemProxy} from "../entities/changeitemproxy";
import {Credentials} from "../credentialsstore/credentials";
import {RemoteBuildServer} from "../../dal/remotebuildserver";
import {SummaryDataProxy} from "../entities/summarydataproxy";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {NotificationWatcher} from "../notifications/notificationwatcher";
import {ModificationSubscriptionImpl} from "./modificationcountersubscriptionimpl";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";

@injectable()
export class NotificationWatcherImpl implements NotificationWatcher {

    private _credentialStore: CredentialsStore;
    private readonly CHECK_FREQUENCY_MS: number = 10000;
    private readonly outdatedChangeIds: string[] = [];
    private readonly outdatedPersonalChangeIds: string[] = [];
    private _remoteBuildServer: RemoteBuildServer;
    private _webLinks: WebLinks;
    private _subscription: ModificationSubscriptionImpl;
    private isActive = true;

    constructor(@inject(TYPES.RemoteBuildServer) remoteBuildServer: RemoteBuildServer,
                @inject(TYPES.WebLinks) webLinks: WebLinks) {
        this._remoteBuildServer = remoteBuildServer;
        this._webLinks = webLinks;
    }

    public init(credentialStore: CredentialsStore) {
        this._credentialStore = credentialStore;
        this._webLinks.init(credentialStore);
        this.activate();
    }

    public dispose() {
        this.isActive = false;
    }

    /**
     * This method activates Notification Watcher. Since user is signed in, it will check if eventCounter is changed.
     * Frequency of requests on server is settled by CHECK_FREQUENCY_MS.
     */
    private async activate() {
        while (this.isActive) {
            let prevEventCounter: number;
            let credentials: Credentials = this._credentialStore.getCredential();
            while (!credentials && this.isActive) {
                await VsCodeUtils.sleep(this.CHECK_FREQUENCY_MS);
                credentials = this._credentialStore.getCredential();
            }
            if (this.isActive) {
                this._remoteBuildServer.init(this._credentialStore);
                const gZippedSummary: Uint8Array[] = await this._remoteBuildServer.getGZippedSummary(credentials.userId);
                const summeryXmlObj: string = VsCodeUtils.gzip2Str(gZippedSummary);
                const summary: SummaryDataProxy = await XmlParser.parseSummary(summeryXmlObj);
                this.updateSubscriptions(summary, credentials.userId);
                const serializedSubscription: string = this._subscription.serialize();
                prevEventCounter = await this._remoteBuildServer.getTotalNumberOfEvents(serializedSubscription);

                //filling outdatedChangeIds and outdatedPersonalChangeIds arrays
                this.collectNewChanges(summary.changes);
                this.collectNewChanges(summary.personalChanges);
            }
            while (credentials && this.isActive) {
                const serializedSubscription: string = this._subscription.serialize();
                const eventCounter: number = await this._remoteBuildServer.getTotalNumberOfEvents(serializedSubscription);
                if (eventCounter === prevEventCounter) {
                    await VsCodeUtils.sleep(this.CHECK_FREQUENCY_MS);
                    credentials = this._credentialStore.getCredential();
                    continue;
                }
                Logger.logInfo("Notification Logger was changed. We should process new notifications.");
                const gZippedSummary: Uint8Array[] = await this._remoteBuildServer.getGZippedSummary(credentials.userId);
                const summeryXmlObj: string = VsCodeUtils.gzip2Str(gZippedSummary);
                const summary: SummaryDataProxy = await XmlParser.parseSummary(summeryXmlObj);
                this.updateSubscriptions(summary, credentials.userId);
                let changes: ChangeItemProxy[] = this.collectNewChanges(summary.changes);
                changes = changes.concat(this.collectNewChanges(summary.personalChanges));
                await this.displayChanges(changes);
                prevEventCounter = eventCounter;
                await VsCodeUtils.sleep(this.CHECK_FREQUENCY_MS);
                credentials = this._credentialStore.getCredential();
            }
            this.resetData();
        }
    }

    private updateSubscriptions(summary: SummaryDataProxy, userId: string): void {
        this._subscription = ModificationSubscriptionImpl.fromTeamServerSummaryData(summary, userId);
    }

    /**
     * This method resets all contained data.
     */
    private resetData() {
        this.outdatedChangeIds.length = 0;
        this.outdatedPersonalChangeIds.length = 0;
        Logger.logDebug("Notification Watcher data were reset");
    }

    /**
     * This method works on the observation that changes in the summary are sorted and the first change in an array is the latest one.
     * @param changes - sorted array of personal or non-personal changes
     * @return - all new changes.
     */
    private collectNewChanges(changes: ChangeItemProxy[]): ChangeItemProxy[] {
        const newChanges: ChangeItemProxy[] = [];
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
    private async displayChanges(changes: ChangeItemProxy[]) {
        const credentials: Credentials = this._credentialStore.getCredential();
        if (!changes || !credentials) {
            Logger.logWarning(`NotificationWatcher#displayChanges: changes or user credentials absent`);
            return;
        }
        for (let changeIndex = 0; changeIndex < changes.length; changeIndex++) {
            const change: ChangeItemProxy = changes[changeIndex];
            const builds: BuildItemProxy[] = change.builds;
            if (change.builds) {
                for (let buildIndex = 0; buildIndex < builds.length; buildIndex++) {
                    const build: BuildItemProxy = change.builds[buildIndex];
                    const buildXml = await this._webLinks.getBuildInfo(build.id);
                    change.builds[buildIndex] = buildXml ? await XmlParser.parseBuild(buildXml) : change.builds[buildIndex];
                }
            }
            const message: string = VsCodeUtils.formMessage(change, credentials.serverURL);
            TeamCityOutput.appendLine(message);
            TeamCityOutput.show();
        }
    }
}
