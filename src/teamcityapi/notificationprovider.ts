"use strict";
import xml2js = require("xml2js");

import { XmlRpcProvider } from "../utils/xmlrpcprovider";
import { VsCodeUtils } from "../utils/vscodeutils";
import { Logger } from "../utils/logger";
import { Credential } from "../credentialstore/credential";
import { SummaryDataProxy } from "../notifications/summarydata";
import { ModificationCounterSubscriptionInfo, ModificationCounterSubscription } from "../notifications/modificationcountersubscription";

export class NotificationProvider extends XmlRpcProvider {
    private _subs : ModificationCounterSubscriptionInfo;
    private _eventCounter : number;
    private static INSTANCE : NotificationProvider;
    private static usedCredentials : Credential;

    constructor(serverURL: string) {
        super(serverURL);
    }

    public static async getInstance(cred: Credential) : Promise<NotificationProvider> {
        if (!NotificationProvider.INSTANCE || cred !== this.usedCredentials) {
            const instance : NotificationProvider = new NotificationProvider(cred.serverURL);
            await instance.init(cred);
            NotificationProvider.INSTANCE = instance;
            this.usedCredentials = cred;
            Logger.logInfo("NotificationProvider#getInstance: instance was initialized");
        }
        return NotificationProvider.INSTANCE;
    }

    //TODO: think of try/catch for getSummeryData and getTotalNumberOfEvents
    public async init(cred : Credential) {
        const summaryData : SummaryDataProxy = await this.getSummeryData(cred);
        this._subs = ModificationCounterSubscription.fromTeamServerSummaryData(summaryData, cred.userId);
        this._eventCounter = await this.getTotalNumberOfEvents();
    }

    /*Reject is not handled.*/
    /**
     * @return - number of event for existing subscriptions.
     * Subs are created at ModificationCounterSubscription.fromTeamServerSummaryData during NotificationProvider#init
     */
    public async getTotalNumberOfEvents() : Promise<number> {
        const prom: Promise<number> = new Promise((resolve, reject) => {
            this.client.methodCall("UserSummaryRemoteManager2.getTotalNumberOfEvents", [this._subs.serialize()], (err, data) => {
                /* tslint:disable:no-null-keyword */
                if (err !== null || data === null) {
                    Logger.logError("UserSummaryRemoteManager2.getTotalNumberOfEvents: return an error: " + err);
                    return reject(err);
                }
                /* tslint:enable:no-null-keyword */
                Logger.logDebug("NotificationProvider#getTotalNumberOfEvents: total number of events is " + data);
                resolve(data);
            });
        });
        return prom;
    }

    /*Reject is not handled.*/
    /*TODO: Reduce count of levels */
    /**
     * @param cred - user Crededential
     * @return SummeryDataProxy object
     */
    public async getSummeryData(cred : Credential) : Promise<SummaryDataProxy> {
        await this.authenticateIfRequired(cred);
        const prom : Promise<SummaryDataProxy> = new Promise((resolve, reject) => {
            this.client.methodCall("UserSummaryRemoteManager2.getGZippedSummary", [cred.userId], (err, data) => {
                /* tslint:disable:no-null-keyword */
                if (err !== null || data === undefined) {
                    Logger.logError("UserSummaryRemoteManager2.getGZippedSummary: return an error: " + err);
                    return reject(err);
                }
                /* tslint:enable:no-null-keyword */
                try {
                    const summeryXmlObj : string = VsCodeUtils.gzip2Str(data);
                    xml2js.parseString(summeryXmlObj, (err, obj) => {
                        if (err) {
                            Logger.logError("NotificationProvider#getSummeryData: caught an error during parsing summary data: " + err);
                            reject(err);
                        }
                        const summeryData : SummaryDataProxy = new SummaryDataProxy(obj.Summary);
                        Logger.logDebug("NotificationProvider#getSummeryData: summary data was successfully parsed");
                        resolve(summeryData);
                    });
                } catch (err) {
                    Logger.logError("NotificationProvider#getSummeryData: caught an error during unzipping and parsing summary data: " + err);
                    reject(err);
                }
            });
        });
        return prom;
    }
}
