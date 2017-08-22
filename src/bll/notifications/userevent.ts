"use strict";

import {TrackerEventType} from "../utils/constants";
import {KeyValueSubscriptionEvent} from "./keyvaluesubscriptionevent";

export class UserEvent extends KeyValueSubscriptionEvent {
    private readonly _userId: string;

    constructor(type: TrackerEventType, userId: string) {
        super(type, "u:"/*PREFIX*/, userId);
        this._userId = userId;
    }

    public get userId() {
        return this._userId;
    }
}
