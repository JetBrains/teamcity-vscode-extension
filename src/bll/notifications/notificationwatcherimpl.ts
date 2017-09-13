"use strict";

import {OutputChannel} from "vscode";
import {Logger} from "../utils/logger";
import {WebLinks} from "../../dal/weblinks";
import {XmlParser} from "../utils/xmlparser";
import {VsCodeUtils} from "../utils/vscodeutils";
import {EventCounter} from "../entities/eventcounter";
import {ChangeStorage} from "../entities/changestorage";
import {TeamCityOutput} from "../../view/teamcityoutput";
import {BuildItemProxy} from "../entities/builditemproxy";
import {ChangeItemProxy} from "../entities/changeitemproxy";
import {Credentials} from "../credentialsstore/credentials";
import {RemoteBuildServer} from "../../dal/remotebuildserver";
import {SummaryDataProxy} from "../entities/summarydataproxy";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {NotificationWatcher} from "../notifications/notificationwatcher";
import {ModificationSubscription} from "./modificationsubscription";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";

@injectable()
export class NotificationWatcherImpl implements NotificationWatcher {

    private readonly changeStorage: ChangeStorage;
    private storedCredentials: Credentials;
    private subscription: ModificationSubscription;
    private eventCounter: EventCounter;

    private readonly CHECK_FREQUENCY_MS: number = 10000;
    private credentialStore: CredentialsStore;
    private webLinks: WebLinks;
    private remoteBuildServer: RemoteBuildServer;
    private shouldNotBeDisposed: boolean;

    constructor(@inject(TYPES.RemoteBuildServer) remoteBuildServer: RemoteBuildServer,
                @inject(TYPES.WebLinks) webLinks: WebLinks) {
        this.remoteBuildServer = remoteBuildServer;
        this.webLinks = webLinks;
        this.shouldNotBeDisposed = true;
        this.changeStorage = new ChangeStorage();
    }

    public initAndActivate(credentialStore: CredentialsStore) {
        this.credentialStore = credentialStore;
        this.remoteBuildServer.init(credentialStore);
        this.webLinks.init(credentialStore);
        Logger.logInfo("NotificationWatcherImpl#initAndActivate: NW was initialized and should be activate now.");

        this.activate().then(() => {
            Logger.logDebug(`NotificationWatcherImpl#initAndActivate: NW has finnished without errors.`);
        }).catch((err) => {
            Logger.logDebug(`NotificationWatcherImpl#initAndActivate: NW has finnished with error: ${err}.`);
        });
    }

    public dispose() {
        Logger.logInfo("NotificationWatcherImpl#dispose: NW should be disposed.");
        this.shouldNotBeDisposed = false;
    }

    private async activate(): Promise<void> {
        await this.reinitWatcherMutableResources();
        while (this.shouldNotBeDisposed) {
            await this.processNewChangesIfRequired();
            await VsCodeUtils.sleep(this.CHECK_FREQUENCY_MS);
            if (this.isNotTheSameUser()) {
                Logger.logInfo("NotificationWatcherImpl#activate: User has changed. ");
                await this.reinitWatcherMutableResources();
            }
        }
        Logger.logDebug("NotificationWatcherImpl#activate: finish watching.");
    }

    private async reinitWatcherMutableResources() {
        Logger.logDebug("NotificationWatcherImpl#reinitWatcherMutableResources: start.");
        this.changeStorage.reset();
        this.storedCredentials = await this.waitAndGetCredentials();
        this.subscription = await this.processNewChangesSilently(this.storedCredentials);
        this.eventCounter = await EventCounter.getInstance(this.remoteBuildServer, this.subscription);
        Logger.logDebug("NotificationWatcherImpl#reinitWatcherMutableResources: finish.");
    }

    private async processNewChangesIfRequired(): Promise<void> {
        const credentials: Credentials = this.credentialStore.getCredential();
        if (!credentials) {
            return;
        }
        const freshEventCounter: EventCounter = await EventCounter.getInstance(this.remoteBuildServer, this.subscription);
        if (this.eventCounter.notEquals(freshEventCounter)) {
            Logger.logInfo("NotificationWatcherImpl#processNewChangesIfRequired: Event counter has changed. Should process new changes.");
            this.subscription = await this.processNewChanges(credentials);
            this.eventCounter.update(freshEventCounter);
        }
    }

    private isNotTheSameUser(): boolean {
        const currentCredentials: Credentials = this.credentialStore.getCredential();
        return !currentCredentials || !currentCredentials.equals(this.storedCredentials);
    }

    private async waitAndGetCredentials(): Promise<Credentials> {
        while (this.shouldNotBeDisposed) {
            const credentials: Credentials = this.credentialStore.getCredential();
            if (credentials) {
                return credentials;
            }
            await VsCodeUtils.sleep(this.CHECK_FREQUENCY_MS);
        }
        return Promise.reject<Credentials>(undefined);
    }

    private async processNewChangesSilently(credentials: Credentials): Promise<ModificationSubscription> {
        const silentModeOn: boolean = true;
        return this.processNewChanges(credentials, silentModeOn);
    }

    private async processNewChanges(credentials: Credentials, silentModeOn: boolean = false): Promise<ModificationSubscription> {
        const summaryDataProxy: SummaryDataProxy = await this.getSummaryData();
        const subscription = ModificationSubscription.generateFromTeamServerSummaryData(summaryDataProxy, credentials.userId);
        const newChanges: ChangeItemProxy[] = this.extractNewChanges(summaryDataProxy);
        this.changeStorage.storeNewChanges(newChanges);

        if (!silentModeOn && newChanges) {
            for (let i = 0; i < newChanges.length; i++) {
                newChanges[i].builds = await this.tryGetExtendedBuildsInfo(newChanges[i]);
            }
            Logger.logDebug(`NotificationWatcherImpl#processNewChangesIfRequired: should display ${newChanges.length} new changes`);
            await this.displayChangesToOutput(newChanges);
        }
        return subscription;
    }

    private async getSummaryData(): Promise<SummaryDataProxy> {
        const gZippedSummary: Uint8Array[] = await this.remoteBuildServer.getGZippedSummary();
        const summeryXmlObj: string = VsCodeUtils.gzip2Xml(gZippedSummary);
        const summaryDataProxy: SummaryDataProxy = await XmlParser.parseSummary(summeryXmlObj);
        return summaryDataProxy;
    }

    private extractNewChanges(summaryDataProxy: SummaryDataProxy): ChangeItemProxy[] {
        const newChanges: ChangeItemProxy[] = [];
        const changeSet = [summaryDataProxy.changes, summaryDataProxy.personalChanges];

        changeSet.forEach((changes) => {
            changes.forEach((change) => {
                if (!this.changeStorage.contains(change)) {
                    newChanges.push(change);
                }
            });
        });

        return newChanges;
    }

    private async tryGetExtendedBuildsInfo(change: ChangeItemProxy): Promise<BuildItemProxy[]> {
        const builds: BuildItemProxy[] = change.builds;
        if (builds) {
            for (let i = 0; i < builds.length; i++) {
                const build: BuildItemProxy = builds[i];
                const buildXml = await this.webLinks.getBuildInfo(build.id);
                builds[i] = buildXml ? await XmlParser.parseBuild(buildXml) : builds[i];
            }
        }
        return builds;
    }

    private async displayChangesToOutput(changes: ChangeItemProxy[]): Promise<void> {
        const credentials: Credentials = this.credentialStore.getCredential();
        if (!changes || !credentials) {
            Logger.logWarning(`NotificationWatcher#displayChanges: changes or user credentials absent`);
            return;
        }

        for (let i = 0; i < changes.length; i++) {
            const message: string = VsCodeUtils.formMessage(changes[i], credentials.serverURL);
            TeamCityOutput.appendLine(message);
            TeamCityOutput.show();
        }
    }
}
