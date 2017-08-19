"use strict";

import xml2js = require("xml2js");
import { Logger } from "../utils/logger";
import { VsCodeUtils } from "../utils/vscodeutils";
import { Credentials } from "../credentialsstore/credentials";
import { SummaryDataProxy } from "../entities/summarydata";
import { XmlRpcProvider } from "../entities/xmlrpcprovider";
import { ModificationCounterSubscriptionInfo, ModificationCounterSubscription } from "../notifications/modificationcountersubscription";

export class NotificationProvider extends XmlRpcProvider {
    private _subscription : ModificationCounterSubscriptionInfo;
    private _eventCounter : number;
    private static INSTANCE : NotificationProvider;
    private static usedCredentials : Credentials;

    constructor(serverURL: string) {
        super(serverURL);
    }

    public static async getInstance(credentials: Credentials) : Promise<NotificationProvider> {
        if (!NotificationProvider.INSTANCE || credentials !== this.usedCredentials) {
            const instance : NotificationProvider = new NotificationProvider(credentials.serverURL);
            await instance.init(credentials);
            NotificationProvider.INSTANCE = instance;
            this.usedCredentials = credentials;
            Logger.logInfo("NotificationProvider#getInstance: instance was initialized");
        }
        return NotificationProvider.INSTANCE;
    }

    //TODO: think of try/catch for getSummeryData and getTotalNumberOfEvents
    public async init(credentials : Credentials) {
        const summaryData : SummaryDataProxy = await this.getSummeryData(credentials);
        this._subscription = ModificationCounterSubscription.fromTeamServerSummaryData(summaryData, credentials.userId);
        this._eventCounter = await this.getTotalNumberOfEvents();
    }

    /*Reject is not handled.*/
    /**
     * @return - number of event for existing subscriptions.
     * Subscription is created at ModificationCounterSubscription.fromTeamServerSummaryData during NotificationProvider#init
     */
    public async getTotalNumberOfEvents() : Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.client.methodCall("UserSummaryRemoteManager2.getTotalNumberOfEvents", [this._subscription.serialize()], (err, data) => {
                /* tslint:disable:no-null-keyword */
                if (err !== null || data === null) {
                    Logger.logError("UserSummaryRemoteManager2.getTotalNumberOfEvents: return an error: " + VsCodeUtils.formatErrorMessage(err));
                    return reject(err);
                }
                /* tslint:enable:no-null-keyword */
                resolve(data);
            });
        });
    }

    /*Reject is not handled.*/
    /*TODO: Reduce count of levels */
    /**
     * @param credentials - user Crededential
     * @return SummeryDataProxy object
     */
    public async getSummeryData(credentials : Credentials) : Promise<SummaryDataProxy> {
        await this.authenticateIfRequired(credentials);
        return new Promise<SummaryDataProxy>((resolve, reject) => {
            this.client.methodCall("UserSummaryRemoteManager2.getGZippedSummary", [credentials.userId], (err, data) => {
                /* tslint:disable:no-null-keyword */
                if (err !== null || data === undefined) {
                    Logger.logError("UserSummaryRemoteManager2.getGZippedSummary: return an error: " + VsCodeUtils.formatErrorMessage(err));
                    return reject(err);
                }
                /* tslint:enable:no-null-keyword */
                try {
                    const summeryXmlObj : string = VsCodeUtils.gzip2Str(data);
                    xml2js.parseString(summeryXmlObj, (err, obj) => {
                        if (err) {
                            Logger.logError("NotificationProvider#getSummeryData: caught an error during parsing summary data: " + VsCodeUtils.formatErrorMessage(err));
                            reject(err);
                        }
                        const summeryData : SummaryDataProxy = new SummaryDataProxy(obj.Summary);
                        Logger.logDebug("NotificationProvider#getSummeryData: summary data was successfully parsed");
                        resolve(summeryData);
                    });
                } catch (err) {
                    Logger.logError("NotificationProvider#getSummeryData: caught an error during unzipping and parsing summary data: " + VsCodeUtils.formatErrorMessage(err));
                    reject(err);
                }
            });
        });
    }
}
