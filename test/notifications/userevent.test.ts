"use strict";

import {assert} from "chai";
import {TrackerEventType} from "../../src/bll/utils/constants";
import {UserEvent} from "../../src/bll/notifications/UserEvent";

suite("UserEvent", () => {
    test("should verify constructor", function () {
        const userEvent: UserEvent = new UserEvent(TrackerEventType.BUILD_CHANGED_STATUS, "239");
        assert.equal(userEvent.userId, "239");
    });

    test("should verify serialize", function () {
        const userEvent: UserEvent = new UserEvent(TrackerEventType.BUILD_CHANGED_STATUS, "239");
        assert.equal(userEvent.serialize(), "d;u:239");
    });
});
