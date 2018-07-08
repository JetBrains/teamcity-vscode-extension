import {inject, injectable} from "inversify";
import {RemoteBuildServer} from "../../dal/remotebuildserver";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {TYPES} from "../utils/constants";
import {Disposable} from "vscode";
import {Utils} from "../utils/utils";
import {Logger} from "../utils/logger";
import {MessageConstants} from "../utils/messageconstants";
import {Credentials} from "../credentialsstore/credentials";
import {XmlParser} from "../utils/xmlparser";
import {TcNotificationMessage} from "./TcNotificationMessage";
import {NotificationManager} from "../../view/NotificationManager";

@injectable()
export class NewNotificationWatcher implements Disposable {

    private readonly CHECK_FREQUENCY_MS: number = 10000;
    private readonly MAX_MESSAGE_COUNT_TO_SHOW_SIMULTANEOUSLY: number = 6;
    private readonly obsoleteNotificationIds: Set<number> = new Set<number>();
    private shouldBeDisposed: boolean = false;
    private storedCredentials: Credentials;
    private myLastTimestamp: number;

    constructor(@inject(TYPES.RemoteBuildServer) private readonly myRemoteBuildServer: RemoteBuildServer,
                @inject(TYPES.CredentialsStore) private readonly myCredentialsStore: CredentialsStore,
                @inject(TYPES.XmlParser) private readonly myXmlParser: XmlParser,
                @inject(TYPES.NotificationManager) private readonly myNotificationManager: NotificationManager) {
        this.activate().catch((err) => {
            console.error(err);
        });
    }

    private async activate(): Promise<void> {
        Logger.logInfo("NotificationWatcherImpl#activate: NW was activated");
        try {
            await this.tryReinitWatcherMutableResources();
        } catch (err) {
            Logger.logError(`NotificationWatcherImpl#activate: an error occurs: ${err}.`);
        }

        while (!this.shouldBeDisposed) {
            try {
                await this.processNewChangesIfRequired();
            } catch (err) {
                Logger.logError(`NotificationWatcherImpl#activate: an error occurs: ${err}.`);
                await this.tryReinitWatcherMutableResources();
            }
            await Utils.sleep(this.CHECK_FREQUENCY_MS);
            if (this.isNotTheSameUser()) {
                Logger.logInfo("NotificationWatcherImpl#activate: User has changed. ");
                await this.tryReinitWatcherMutableResources();
            }
        }
        Logger.logDebug("NotificationWatcherImpl#activate: finish watching.");
    }

    private async tryReinitWatcherMutableResources() {
        while (!this.shouldBeDisposed) {
            try {
                await this.reinitWatcherMutableResources();
                break;
            } catch (err) {
                if (!err) {
                    Logger.logError(`NotificationWatcherImpl#tryReinitWatcherMutableResources: ` +
                        `NotificationWatcher failed with empty error: ` + new Error().stack);
                } else {
                    err = (err.code === ("ENOENT" || "ENOTFOUND")) ? MessageConstants.URL_NOT_REACHABLE : err;
                    Logger.logError(`NotificationWatcher failed with ${Utils.formatErrorMessage(err)}`);
                }
                await Utils.sleep(5000);
            }
        }
    }

    private isNotTheSameUser(): boolean {
        const currentCredentials: Credentials = this.myCredentialsStore.getCredentialsSilently();
        return !currentCredentials || !currentCredentials.equals(this.storedCredentials);
    }

    private async processNewChangesIfRequired(): Promise<void> {
        const credentials: Credentials = this.myCredentialsStore.getCredentialsSilently();
        if (!credentials) {
            return;
        }
        const buildMessages: string[] = await this.myRemoteBuildServer.getBuildMessages(this.myLastTimestamp);
        if (buildMessages && buildMessages.length > 0) {
            Logger.logInfo("NotificationWatcherImpl#processNewChangesIfRequired: Event counter has changed. Should process new changes.");
            const parsedMessages: TcNotificationMessage[] = [];
            for (const message of buildMessages) {
                const parsedMessage: TcNotificationMessage = await this.myXmlParser.parseNotificationMessage(message);
                parsedMessages.push(parsedMessage);
            }
            parsedMessages.sort((nm1: TcNotificationMessage, nm2: TcNotificationMessage) => {
                const diff: number = nm1.myModificationCounter - nm2.myModificationCounter;
                return diff > 0 ? 1 : (diff < 0 ? -1 : 0);
            });
            this.updateLastTimestamp(parsedMessages);
            await this.dispatchNotificationMessages(parsedMessages);
        }
    }

    private updateLastTimestamp(sortedMessages: TcNotificationMessage[]): void {
        if (sortedMessages.length > 0) {
            this.myLastTimestamp = sortedMessages[sortedMessages.length - 1].myModificationCounter;
        }
    }

    // Major messages - messages that will be shown any way
    // Minor messages - messages that may be shown and may be not
    // Obsolete messages - messages that will not be shown any way
    private async dispatchNotificationMessages(parsedMessage: TcNotificationMessage[]): Promise<void> {
        const obsoleteNotificationIds: Set<number> = this.obsoleteNotificationIds;
        let majorCount: number = 0;

        parsedMessage.forEach((message: TcNotificationMessage) => {
            if (message.myIsImportant && !obsoleteNotificationIds.has(message.myModificationCounter)) {
                majorCount++;
            }
        });

        let minorProcessed: number = 0;
        let notProcessed: number = 0;
        parsedMessage.forEach(async (message: TcNotificationMessage) => {
            if (obsoleteNotificationIds.has(message.myModificationCounter)) {
                //
            } else if (message.myIsImportant) {
                await this.processNewMessage(message);
            } else if (majorCount + minorProcessed < this.MAX_MESSAGE_COUNT_TO_SHOW_SIMULTANEOUSLY) {
                minorProcessed++;
                await this.processNewMessage(message);
            } else {
                notProcessed++;
                await this.processNewMessage(message, true);
            }
        });

        if (majorCount + minorProcessed > 0) {
            Logger.logInfo(`${majorCount + minorProcessed + notProcessed} more notifications were ` +
                `received from TeamCity / ${majorCount + minorProcessed} shown`);
        }
    }

    private async processNewMessage(message: TcNotificationMessage, silent: boolean = false) {
        this.obsoleteNotificationIds.add(message.myModificationCounter);
        if (!silent) {
            this.myNotificationManager.showNotificationMessage(message);
        }
    }

    private async reinitWatcherMutableResources() {
        Logger.logDebug("NotificationWatcherImpl#reinitWatcherMutableResources: start.");
        this.storedCredentials = await this.waitAndGetCredentials();
        this.myLastTimestamp = await this.myRemoteBuildServer.getCurrentTimestamp();
        Logger.logDebug("NotificationWatcherImpl#reinitWatcherMutableResources: finish.");
    }

    private async waitAndGetCredentials(): Promise<Credentials> {
        while (!this.shouldBeDisposed) {
            const credentials: Credentials = this.myCredentialsStore.getCredentialsSilently();
            if (credentials) {
                Logger.logInfo(`NotificationWatcherImpl#waitAndGetCredentials: user ${credentials.userId} is logged in.`);
                return credentials;
            }
            await Utils.sleep(this.CHECK_FREQUENCY_MS);
        }
        Logger.logInfo(`NotificationWatcherImpl#waitAndGetCredentials: shouldNotBeDisposed - abort operation`);
        return Promise.reject<Credentials>(undefined);
    }

    public dispose(): any {
        this.shouldBeDisposed = true;
    }
}
