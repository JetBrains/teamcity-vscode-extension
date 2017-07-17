"use strict";

import { assert, expect } from "chai";
import { BuildConfig, BuildConfigTreeDataProvider } from "../../src/remoterun/configexplorer";
import xmlrpc = require("xmlrpc");

suite("ConfigExplorer", () => {
    test("should verify BuildConfig constructor", function() {
        const buildConfig : BuildConfig = new BuildConfig("id", "label");
        assert.equal(buildConfig.id, "id");
        assert.equal(buildConfig.label, "label");
        assert.equal(buildConfig.isIncl, false);
    });

    test("should verify BuildConfig incorrect constructor", function() {
        const buildConfig : BuildConfig = new BuildConfig(undefined, undefined);
        assert.equal(buildConfig.id, undefined);
        assert.equal(buildConfig.label, undefined);
    });

    test("should verify BuildConfig change", function() {
        const buildConfig : BuildConfig = new BuildConfig("id", "label");
        buildConfig.changeState();
        assert.equal(buildConfig.isIncl, true);
    });

    test("should verify BuildConfigTreeDataProvider setConfigs", function() {
        let bcArr : BuildConfig[] = [];
        const configExplorer : BuildConfigTreeDataProvider = new BuildConfigTreeDataProvider();
        bcArr.push(new BuildConfig("id1", "label1"));
        bcArr.push(new BuildConfig("id2", "label2"));
        configExplorer.setConfigs(bcArr);
        assert.equal(configExplorer.getChildren(), bcArr);
    });

    test("should verify BuildConfigTreeDataProvider getInclBuilds", function() {
        let bcArr : BuildConfig[] = [];
        const configExplorer : BuildConfigTreeDataProvider = new BuildConfigTreeDataProvider();
        bcArr.push(new BuildConfig("id1", "label1"));
        assert.equal(configExplorer.getInclBuilds.length, 0);
        let bc : BuildConfig = new BuildConfig("id2", "label2");
        bc.changeState();
        bcArr.push(bc);
        configExplorer.setConfigs(bcArr);
        assert.equal(configExplorer.getInclBuilds()[0].id, "id2");
    });
});