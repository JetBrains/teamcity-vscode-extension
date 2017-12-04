"use strict";

import {assert} from "chai";
import {BuildConfigItem} from "../../src/bll/entities/buildconfigitem";

suite("DataProviderManager", () => {
    test("should verify BuildConfig constructor", function () {
        const buildConfig: BuildConfigItem = new BuildConfigItem("id", "externalId", "label");
        assert.equal(buildConfig.id, "id");
        assert.equal(buildConfig.externalId, "externalId");
        assert.equal(buildConfig.label, "label");
        assert.equal(buildConfig.isIncluded, false);
    });

    test("should verify BuildConfig incorrect constructor", function () {
        const buildConfig: BuildConfigItem = new BuildConfigItem(undefined, undefined, undefined);
        assert.equal(buildConfig.id, undefined);
        assert.equal(buildConfig.externalId, undefined);
        assert.equal(buildConfig.label, undefined);
    });

    test("should verify BuildConfig change", function () {
        const buildConfig: BuildConfigItem = new BuildConfigItem("id", "externalId", "label");
        buildConfig.changeState();
        assert.equal(buildConfig.isIncluded, true);
    });
});
