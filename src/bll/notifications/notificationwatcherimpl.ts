"use strict";

import {OutputChannel} from "vscode";
import {Logger} from "../utils/logger";
import {Build} from "../entities/build";
import {Change} from "../entities/change";
import {Summary} from "../entities/summary";
import {WebLinks} from "../../dal/weblinks";
import {BuildDao} from "../../dal/builddao";
import {XmlParser} from "../utils/xmlparser";
import {SummaryDao} from "../../dal/summarydao";
import {VsCodeUtils} from "../utils/vscodeutils";
import {EventCounter} from "../entities/eventcounter";
import {ChangeStorage} from "../entities/changestorage";
import {TeamCityOutput} from "../../view/teamcityoutput";
import {Credentials} from "../credentialsstore/credentials";
import {RemoteBuildServer} from "../../dal/remotebuildserver";
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
    private teamCityOutput: TeamCityOutput;
    private remoteBuildServer: RemoteBuildServer;
    private summaryDao: SummaryDao;
    private buildDao: BuildDao;
    private shouldNotBeDisposed: boolean;

    constructor(@inject(TYPES.RemoteBuildServer) remoteBuildServer: RemoteBuildServer,
                @inject(TYPES.SummaryDao) summaryDao: SummaryDao,
                @inject(TYPES.BuildDao) buildDao: BuildDao) {
        this.remoteBuildServer = remoteBuildServer;
        this.summaryDao = summaryDao;
        this.buildDao = buildDao;
        this.shouldNotBeDisposed = true;
        this.changeStorage = new ChangeStorage();
    }

    public initAndActivate(credentialStore: CredentialsStore, teamCityOutput: TeamCityOutput) {
        this.credentialStore = credentialStore;
        this.teamCityOutput = teamCityOutput;
        this.buildDao.init(credentialStore);
        this.summaryDao.init(credentialStore);
        this.remoteBuildServer.init(credentialStore);
        Logger.logInfo("NotificationWatcherImpl#initAndActivate: NW was initialized and should be activate now.");
        this.activate().then(() => {
            Logger.logDebug(`NotificationWatcherImpl#initAndActivate: NW has finnished without errors.`);
        }).catch((err) => {
            Logger.logError(`NotificationWatcherImpl#initAndActivate: NW has finnished with error: ${err}.`);
        });
    }

    public dispose() {
        Logger.logInfo("NotificationWatcherImpl#dispose: NW should be disposed.");
        this.shouldNotBeDisposed = false;
    }

    private async activate(): Promise<void> {
        await this.reinitWatcherMutableResources();
        while (this.shouldNotBeDisposed) {
            try {
                await this.processNewChangesIfRequired();
            } catch (err) {
                Logger.logError(`NotificationWatcherImpl#activate: an error occurs: ${err}.`);
                await this.reinitWatcherMutableResources();
            }
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
                Logger.logInfo(`NotificationWatcherImpl#waitAndGetCredentials: user ${credentials.userId} is logged in.`);
                return credentials;
            }
            await VsCodeUtils.sleep(this.CHECK_FREQUENCY_MS);
        }
        Logger.logInfo(`NotificationWatcherImpl#waitAndGetCredentials: shouldNotBeDisposed - abort opperation`);
        return Promise.reject<Credentials>(undefined);
    }

    private async processNewChangesSilently(credentials: Credentials): Promise<ModificationSubscription> {
        const silentModeOn: boolean = true;
        return this.processNewChanges(credentials, silentModeOn);
    }

    private async processNewChanges(credentials: Credentials, silentModeOn: boolean = false): Promise<ModificationSubscription> {
        const summary: Summary = await this.summaryDao.get();
        const subscription = ModificationSubscription.generateFromTeamServerSummaryData(summary, credentials.userId);
        const newChanges: Change[] = this.changeStorage.extractNewChangesFromSummary(summary);
        this.changeStorage.storeNewChanges(newChanges);

        if (!silentModeOn && newChanges) {
            for (let i = 0; i < newChanges.length; i++) {
                newChanges[i].builds = await this.tryGetExtendedBuildsInfo(newChanges[i].builds);
            }
            Logger.logDebug(`NotificationWatcherImpl#processNewChangesIfRequired: should display ${newChanges.length} new changes`);
            await this.displayChangesToOutput(newChanges);
        }
        return subscription;
    }

    private async tryGetExtendedBuildsInfo(builds: Build[]): Promise<Build[]> {
        const extendedBuilds: Build[] = [];
        for (let i = 0; i < builds.length; i++) {
            if (builds[i].id !== undefined) {
                extendedBuilds.push(await this.buildDao.getById(builds[i].id));
            }
        }
        return extendedBuilds;
    }

    private async displayChangesToOutput(changes: Change[]): Promise<void> {
        const credentials: Credentials = this.credentialStore.getCredential();
        if (!changes || !credentials) {
            Logger.logWarning(`NotificationWatcher#displayChangesToOutput: changes or user credentials absent`);
            return;
        }

        for (let i = 0; i < changes.length; i++) {
            const message: string = VsCodeUtils.formMessage(changes[i], credentials.serverURL);
            this.teamCityOutput.appendLine(message);
            this.teamCityOutput.show();
        }
    }
}
