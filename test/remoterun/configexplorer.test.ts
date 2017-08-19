"use strict";

import { assert } from "chai";
import xmlrpc = require("xmlrpc");
import { ProjectItem } from "../../src/entities/projectitem";
import { BuildConfigItem } from "../../src/entities/leaveitems";
import { BuildConfigTreeDataProvider } from "../../src/remoterun/configexplorer";

suite("ConfigExplorer", () => {
    test("should verify BuildConfig constructor", function() {
        const buildConfig : BuildConfigItem = new BuildConfigItem("id", "externalId", "label");
        assert.equal(buildConfig.id, "id");
        assert.equal(buildConfig.externalId, "externalId");
        assert.equal(buildConfig.label, "label");
        assert.equal(buildConfig.isIncluded, false);
    });

    test("should verify BuildConfig incorrect constructor", function() {
        const buildConfig : BuildConfigItem = new BuildConfigItem(undefined, undefined, undefined);
        assert.equal(buildConfig.id, undefined);
        assert.equal(buildConfig.externalId, undefined);
        assert.equal(buildConfig.label, undefined);
    });

    test("should verify BuildConfig change", function() {
        const buildConfig : BuildConfigItem = new BuildConfigItem("id", "externalId", "label");
        buildConfig.changeState();
        assert.equal(buildConfig.isIncluded, true);
    });

    test("should verify BuildConfigTreeDataProvider setConfigs", function() {
        const bcArr : ProjectItem[] = [];
        const configExplorer : BuildConfigTreeDataProvider = new BuildConfigTreeDataProvider();
        bcArr.push(new ProjectItem("id1", []));
        bcArr.push(new ProjectItem("id2", []));
        configExplorer.setExplorerContent(bcArr);
        assert.equal(configExplorer.getChildren(), bcArr);
    });

    test("should verify BuildConfigTreeDataProvider getIncludedBuildConfigs", function() {
        const projectArr : ProjectItem[] = [];
        const configExplorer : BuildConfigTreeDataProvider = new BuildConfigTreeDataProvider();
        const bcItem1 : BuildConfigItem = new BuildConfigItem("id1", "externalId1", "name1");
        const bcItem2 : BuildConfigItem = new BuildConfigItem("id2", "externalId2", "name2");
        projectArr.push(new ProjectItem("id1", [bcItem1, bcItem2]));
        configExplorer.setExplorerContent(projectArr);
        assert.equal(configExplorer.getIncludedBuildConfigs().length, 0);
        bcItem1.changeState();
        assert.equal(configExplorer.getIncludedBuildConfigs().length, 1);
    });
});
