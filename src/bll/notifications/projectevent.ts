import {TrackerEventType} from "../utils/constants";
import {KeyValueSubscriptionEvent} from "./keyvaluesubscriptionevent";

export class ProjectEvent extends KeyValueSubscriptionEvent {
    private readonly _projectId: string;

    constructor(type: TrackerEventType, projectId: string) {
        super(type, "p:"/*PREFIX*/, projectId);
        this._projectId = projectId;
    }

    public get projectId(): string {
        return this._projectId;
    }
}
