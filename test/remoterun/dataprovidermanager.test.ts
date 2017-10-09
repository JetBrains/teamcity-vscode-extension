"use strict";

import {assert} from "chai";
import {ProjectItem} from "../../src/bll/entities/projectitem";
import {BuildConfigItem} from "../../src/bll/entities/buildconfigitem";
import {DataProviderManager} from "../../src/view/dataprovidermanager";

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

    test("should verify TeamCityTreeDataProvider getIncludedBuildConfigs", function () {
        const projectArr: ProjectItem[] = [];
        const bcItem1: BuildConfigItem = new BuildConfigItem("id1", "externalId1", "name1");
        const bcItem2: BuildConfigItem = new BuildConfigItem("id2", "externalId2", "name2");
        projectArr.push(new ProjectItem("id1", [bcItem1, bcItem2]));
        DataProviderManager.setExplorerContentAndRefresh(projectArr);
        assert.equal(DataProviderManager.getIncludedBuildConfigs().length, 0);
        bcItem1.changeState();
        assert.equal(DataProviderManager.getIncludedBuildConfigs().length, 1);
    });
});
