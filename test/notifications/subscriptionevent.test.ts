"use strict";

import { assert } from "chai";
import { UserEvent, ProjectEvent } from "../../src/notifications/subscriptionevent";
import { TrackerEventType } from "../../src/utils/constants";

suite("UserEvent", () => {
    test("should verify constructor", function() {
        const userEvent : UserEvent = new UserEvent(TrackerEventType.BUILD_CHANGED_STATUS, "239");
        assert.equal(userEvent.userId, "239");
    });

    test("should verify serialize", function() {
        const userEvent : UserEvent = new UserEvent(TrackerEventType.BUILD_CHANGED_STATUS, "239");
        assert.equal(userEvent.serialize(), "d;u:239");
    });
});

suite("ProjectEvent", () => {
    test("should verify constructor", function() {
        const projectEvent : ProjectEvent = new ProjectEvent(TrackerEventType.BUILD_CHANGED_STATUS, "239");
        assert.equal(projectEvent.projectId, "239");
    });

    test("should verify serialize", function() {
        const projectEvent : ProjectEvent = new ProjectEvent(TrackerEventType.BUILD_CHANGED_STATUS, "239");
        assert.equal(projectEvent.serialize(), "d;p:239");
    });
});
