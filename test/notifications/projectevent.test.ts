"use strict";

import {assert} from "chai";
import {TrackerEventType} from "../../src/bll/utils/constants";
import {ProjectEvent} from "../../src/bll/notifications/ProjectEvent";

suite("ProjectEvent", () => {
    test("should verify constructor", function () {
        const projectEvent: ProjectEvent = new ProjectEvent(TrackerEventType.BUILD_CHANGED_STATUS, "239");
        assert.equal(projectEvent.projectId, "239");
    });

    test("should verify serialize", function () {
        const projectEvent: ProjectEvent = new ProjectEvent(TrackerEventType.BUILD_CHANGED_STATUS, "239");
        assert.equal(projectEvent.serialize(), "d;p:239");
    });
});
