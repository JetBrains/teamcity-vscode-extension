"use strict";
import xml2js = require("xml2js");

import { XmlRpcProvider } from "../utils/xmlrpcprovider";
import { Strings } from "../utils/strings";
import { VsCodeUtils } from "../utils/vscodeutils";
import { Credential } from "../credentialstore/credential";
import { Constants } from "../utils/constants";
import { SummaryDataProxy } from "../notifications/summarydata";
import { ModificationCounterSubscriptionInfo, ModificationCounterSubscription } from "../notifications/modificationcountersubscription";

export class NotificationProvider extends XmlRpcProvider {
    private _subs : ModificationCounterSubscriptionInfo;
    private _eventCounter : number;
    constructor(serverURL: string) {
        super(serverURL);
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
                    return reject(err);
                }
                /* tslint:enable:no-null-keyword */
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
    private async getSummeryData(cred : Credential) : Promise<SummaryDataProxy> {
        await this.authenticateIfRequired(cred);
        const prom : Promise<SummaryDataProxy> = new Promise((resolve, reject) => {
            this.client.methodCall("UserSummaryRemoteManager2.getGZippedSummary", [cred.userId], (err, data) => {
                /* tslint:disable:no-null-keyword */
                if (err !== null || data === undefined) {
                    return reject(err);
                }
                /* tslint:enable:no-null-keyword */
                try {
                    const summeryXmlObj : string = VsCodeUtils.gzip2Str(data);
                    xml2js.parseString(summeryXmlObj, (err, obj) => {
                        if (err) {
                            reject(err);
                        }
                        const summeryData : SummaryDataProxy = new SummaryDataProxy(obj.Summary);
                        resolve(summeryData);
                    });
                } catch (err) {
                    reject(err);
                }
            });
        });
        return prom;
    }
}
