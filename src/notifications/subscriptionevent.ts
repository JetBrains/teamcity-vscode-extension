"use strict";
import { TrackerEventType } from "../utils/constants";

export interface ISubscriptionEvent {
    serialize() : string;
}

abstract class KeyValueSubscriptionEvent implements ISubscriptionEvent {
    private readonly _key : string;
    private readonly _value : string;
    private readonly _type : TrackerEventType;

    public serialize() : string {
      return this._type + ";" + this._key + this._value;
    }

    constructor(type : TrackerEventType, key : string, value : string) {
        this._type = type;
        this._key = key;
        this._value = value;
    }
}

export class ProjectEvent extends KeyValueSubscriptionEvent {
    private readonly _projectId : string;

    constructor(type : TrackerEventType, projectId : string) {
        super(type, "p:"/*PREFIX*/, projectId);
        this._projectId = projectId;
    }

    public get projectId() : string {
        return this._projectId;
    }
}

export class UserEvent extends KeyValueSubscriptionEvent {
    private readonly _userId : string;

    constructor(type : TrackerEventType, userId : string) {
        super(type, "u:"/*PREFIX*/, userId);
        this._userId = userId;
    }

    public get userId() {
        return this._userId;
    }
}
