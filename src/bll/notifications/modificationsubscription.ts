"use strict";

import {UserEvent} from "./userevent";
import {Serializable} from "./serializable";
import {ProjectEvent} from "./projectevent";
import {TrackerEventType} from "../utils/constants";
import {SummaryDataProxy} from "../entities/summarydataproxy";
import {SubscriptionEvent} from "./subscriptionevent";

export class ModificationSubscription implements Serializable {
    private readonly myEvents: SubscriptionEvent[] = [];

    public serialize(): string {
        const stringBuilder: string[] = [];
        this.myEvents.forEach((event) => {
            stringBuilder.push(event.serialize() + ",");
        });
        return stringBuilder.join("");
    }

    private addEvent(evt: SubscriptionEvent): void {
        this.myEvents.push(evt);
    }

    public addProjectEvent(type: TrackerEventType, projectId: string): void {
        this.addEvent(new ProjectEvent(type, projectId));
    }

    public addUserEvent(type: TrackerEventType, userId: string) {
        this.addEvent(new UserEvent(type, userId));
    }

    public static generateFromTeamServerSummaryData(data: SummaryDataProxy, userId: string): ModificationSubscription {
        const subscription = new ModificationSubscription();
        data.getVisibleProjectIds.forEach((projectId) => {
            subscription.addProjectEvent(TrackerEventType.BUILD_TYPE_ACTIVE_STATUS_CHANGED, projectId);
            subscription.addProjectEvent(TrackerEventType.BUILD_TYPE_RESPONSIBILITY_CHANGES, projectId);
            subscription.addProjectEvent(TrackerEventType.BUILD_TYPE_ADDED_TO_QUEUE, projectId);
            subscription.addProjectEvent(TrackerEventType.BUILD_TYPE_REMOVED_FROM_QUEUE, projectId);
            subscription.addProjectEvent(TrackerEventType.BUILD_TYPE_REGISTERED, projectId);
            subscription.addProjectEvent(TrackerEventType.BUILD_TYPE_UNREGISTERED, projectId);
            subscription.addProjectEvent(TrackerEventType.BUILD_STARTED, projectId);
            subscription.addProjectEvent(TrackerEventType.BUILD_FINISHED, projectId);
            subscription.addProjectEvent(TrackerEventType.BUILD_INTERRUPTED, projectId);
            subscription.addProjectEvent(TrackerEventType.PROJECT_PERSISTED, projectId);
            subscription.addProjectEvent(TrackerEventType.PROJECT_REMOVED, projectId);
            subscription.addProjectEvent(TrackerEventType.PROJECT_RESTORED, projectId);
            subscription.addProjectEvent(TrackerEventType.PROJECT_ARCHIVED, projectId);
            subscription.addProjectEvent(TrackerEventType.PROJECT_DEARCHIVED, projectId);
            subscription.addProjectEvent(TrackerEventType.TEST_RESPONSIBILITY_CHANGED, projectId);
            subscription.addProjectEvent(TrackerEventType.TEST_MUTE_UPDATED, projectId);
        });

        subscription.addUserEvent(TrackerEventType.CHANGE_ADDED, userId);
        subscription.addUserEvent(TrackerEventType.PERSONAL_BUILD_CHANGED_STATUS, userId);
        subscription.addUserEvent(TrackerEventType.PERSONAL_BUILD_STARTED, userId);
        subscription.addUserEvent(TrackerEventType.PERSONAL_BUILD_FINISHED, userId);
        subscription.addUserEvent(TrackerEventType.PERSONAL_BUILD_INTERRUPTED, userId);

        subscription.addUserEvent(TrackerEventType.USER_ACCOUNT_CHANGED, userId);
        subscription.addUserEvent(TrackerEventType.USER_ACCOUNT_REMOVED, userId);
        subscription.addUserEvent(TrackerEventType.NOTIFICATION_RULES_CHANGED, userId);

        return subscription;
    }
}
