"use strict";

import {SubscriptionEvent} from "../interfaces/subscriptionevent";
import {TrackerEventType} from "../utils/constants";

export abstract class KeyValueSubscriptionEvent implements SubscriptionEvent {
    private readonly _key: string;
    private readonly _value: string;
    private readonly _type: TrackerEventType;

    public serialize(): string {
        return this._type + ";" + this._key + this._value;
    }

    constructor(type: TrackerEventType, key: string, value: string) {
        this._type = type;
        this._key = key;
        this._value = value;
    }
}
