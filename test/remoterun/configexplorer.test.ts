"use strict";

import { assert, expect } from "chai";
import { ProjectItem, BuildConfigItem, BuildConfigTreeDataProvider } from "../../src/remoterun/configexplorer";
import xmlrpc = require("xmlrpc");

suite("ConfigExplorer", () => {
    test("should verify BuildConfig constructor", function() {
        const buildConfig : BuildConfigItem = new BuildConfigItem("id", "label");
        assert.equal(buildConfig.id, "id");
        assert.equal(buildConfig.label, "label");
        assert.equal(buildConfig.isIncl, false);
    });

    test("should verify BuildConfig incorrect constructor", function() {
        const buildConfig : BuildConfigItem = new BuildConfigItem(undefined, undefined);
        assert.equal(buildConfig.id, undefined);
        assert.equal(buildConfig.label, undefined);
    });

    test("should verify BuildConfig change", function() {
        const buildConfig : BuildConfigItem = new BuildConfigItem("id", "label");
        buildConfig.changeState();
        assert.equal(buildConfig.isIncl, true);
    });

    test("should verify BuildConfigTreeDataProvider setConfigs", function() {
        const bcArr : ProjectItem[] = [];
        const configExplorer : BuildConfigTreeDataProvider = new BuildConfigTreeDataProvider();
        bcArr.push(new ProjectItem("id1", []));
        bcArr.push(new ProjectItem("id2", []));
        configExplorer.setProjects(bcArr);
        assert.equal(configExplorer.getChildren(), bcArr);
    });

    test("should verify BuildConfigTreeDataProvider getInclBuilds", function() {
        const projectArr : ProjectItem[] = [];
        const configExplorer : BuildConfigTreeDataProvider = new BuildConfigTreeDataProvider();
        const bcItem1 : BuildConfigItem = new BuildConfigItem("id1", "name1");
        const bcItem2 : BuildConfigItem = new BuildConfigItem("id2", "name2");
        projectArr.push(new ProjectItem("id1", [bcItem1, bcItem2]));
        configExplorer.setProjects(projectArr);
        assert.equal(configExplorer.getInclBuilds().length, 0);
        bcItem1.changeState();
        assert.equal(configExplorer.getInclBuilds().length, 1);
    });
});
