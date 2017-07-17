"use strict";

import { assert, expect } from "chai";
import { SourceControlResourceState, Uri } from "vscode";
import { BuildConfig } from "../../src/remoterun/configexplorer";
import { PatchSender, TccPatchSender} from "../../src/remoterun/patchsender";


suite("PatchSender", () => {
    test("should verify TccPatchSender configArray2String with empty array", function() {
        const bcArr : BuildConfig[] = [];
        const patchSender : TccPatchSender = new TccPatchSender();
        assert.equal(patchSender.getTestObject().configArray2String(bcArr), '""');
        assert.equal(patchSender.getTestObject().configArray2String(undefined), '""');
    });

    test("should verify TccPatchSender configArray2String with one buildConfig", function() {
        const buildConfig : BuildConfig = new BuildConfig("id", "label");
        const bcArr : BuildConfig[] = [buildConfig];
        const patchSender : TccPatchSender = new TccPatchSender();
        assert.equal(patchSender.getTestObject().configArray2String(bcArr), '"id"');
    });

    test("should verify TccPatchSender configArray2String two buildConfigs", function() {
        const buildConfig : BuildConfig = new BuildConfig("id", "label");
        const buildConfig2 : BuildConfig = new BuildConfig("id2", "label2");
        const bcArr : BuildConfig[] = [buildConfig, buildConfig2];
        const patchSender : TccPatchSender = new TccPatchSender();
        assert.equal(patchSender.getTestObject().configArray2String(bcArr), '"id,id2"');
    });

    test("should verify TccPatchSender fileArray2String", function() {
        const patchSender : TccPatchSender = new TccPatchSender();
        const res1Uri : Uri = new Uri();
        const res1 : SourceControlResourceState = {
            resourceUri: res1Uri
        }
        const res2Uri : Uri = new Uri();

        const res2 : SourceControlResourceState = {
            resourceUri: res1Uri
        }
        assert.equal(patchSender.getTestObject().fileArray2String([res1, res2]), '"" ""');
    });
});