"use strict";
import { ISubscriptionEvent, ProjectEvent, UserEvent } from "./subscriptionevent";
import { SummaryDataProxy } from "./summarydata";
import { TrackerEventType } from "../utils/constants";
import { Logger } from "../utils/logger";

export interface ModificationCounterSubscriptionInfo {
    serialize() : string;
}

export class ModificationCounterSubscription implements ModificationCounterSubscriptionInfo {
    private readonly myEvents : ISubscriptionEvent[] = [];

    public serialize() : string {
      const sb : string[] = [];
      this.myEvents.forEach((event) => {
          sb.push(event.serialize() + ",");
      });
      const serializedString : string = sb.join("");
      return serializedString;
    }

    private addEvent(evt : ISubscriptionEvent) : void {
      this.myEvents.push(evt);
    }

    public addProjectEvent(type : TrackerEventType, projectId : string) : void {
      this.addEvent(new ProjectEvent(type, projectId));
    }

    public addUserEvent(type: TrackerEventType, userId: string) {
        this.addEvent(new UserEvent(type, userId));
    }

    public static fromTeamServerSummaryData(data : SummaryDataProxy, userId : string) : ModificationCounterSubscription {
      const subs = new ModificationCounterSubscription();
      data.getVisibleProjectIds.forEach((projectId) => {
          subs.addProjectEvent(TrackerEventType.BUILD_TYPE_ACTIVE_STATUS_CHANGED, projectId);
          subs.addProjectEvent(TrackerEventType.BUILD_TYPE_RESPONSIBILITY_CHANGES, projectId);
          subs.addProjectEvent(TrackerEventType.BUILD_TYPE_ADDED_TO_QUEUE, projectId);
          subs.addProjectEvent(TrackerEventType.BUILD_TYPE_REMOVED_FROM_QUEUE, projectId);
          subs.addProjectEvent(TrackerEventType.BUILD_TYPE_REGISTERED, projectId);
          subs.addProjectEvent(TrackerEventType.BUILD_TYPE_UNREGISTERED, projectId);
          subs.addProjectEvent(TrackerEventType.BUILD_STARTED, projectId);
          subs.addProjectEvent(TrackerEventType.BUILD_FINISHED, projectId);
          subs.addProjectEvent(TrackerEventType.BUILD_INTERRUPTED, projectId);
          subs.addProjectEvent(TrackerEventType.PROJECT_PERSISTED, projectId);
          subs.addProjectEvent(TrackerEventType.PROJECT_REMOVED, projectId);
          subs.addProjectEvent(TrackerEventType.PROJECT_RESTORED, projectId);
          subs.addProjectEvent(TrackerEventType.PROJECT_ARCHIVED, projectId);
          subs.addProjectEvent(TrackerEventType.PROJECT_DEARCHIVED, projectId);
          subs.addProjectEvent(TrackerEventType.TEST_RESPONSIBILITY_CHANGED, projectId);
          subs.addProjectEvent(TrackerEventType.TEST_MUTE_UPDATED, projectId);
      });

      subs.addUserEvent(TrackerEventType.CHANGE_ADDED, userId);
      subs.addUserEvent(TrackerEventType.PERSONAL_BUILD_CHANGED_STATUS, userId);
      subs.addUserEvent(TrackerEventType.PERSONAL_BUILD_STARTED, userId);
      subs.addUserEvent(TrackerEventType.PERSONAL_BUILD_FINISHED, userId);
      subs.addUserEvent(TrackerEventType.PERSONAL_BUILD_INTERRUPTED, userId);

      subs.addUserEvent(TrackerEventType.USER_ACCOUNT_CHANGED, userId);
      subs.addUserEvent(TrackerEventType.USER_ACCOUNT_REMOVED, userId);
      subs.addUserEvent(TrackerEventType.NOTIFICATION_RULES_CHANGED, userId);

      return subs;
    }
}
