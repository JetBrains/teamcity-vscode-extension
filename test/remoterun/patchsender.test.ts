"use strict";

import { assert } from "chai";
import { SourceControlResourceState, Uri } from "vscode";
import { BuildConfigItem } from "../../src/remoterun/configexplorer";
import { PatchSender, TccPatchSender} from "../../src/remoterun/patchsender";

suite("PatchSender", () => {
    test("should verify TccPatchSender configArray2String with empty array", function() {
        const bcArr : BuildConfigItem[] = [];
        const patchSender : TccPatchSender = new TccPatchSender();
        assert.equal(patchSender.getTestObject().configArray2String(bcArr), `""`);
        assert.equal(patchSender.getTestObject().configArray2String(undefined), `""`);
    });

    test("should verify TccPatchSender configArray2String with one buildConfig", function() {
        const buildConfig : BuildConfigItem = new BuildConfigItem("id", "label");
        const bcArr : BuildConfigItem[] = [buildConfig];
        const patchSender : TccPatchSender = new TccPatchSender();
        assert.equal(patchSender.getTestObject().configArray2String(bcArr), `"id"`);
    });

    test("should verify TccPatchSender configArray2String two buildConfigs", function() {
        const buildConfig : BuildConfigItem = new BuildConfigItem("id", "label");
        const buildConfig2 : BuildConfigItem = new BuildConfigItem("id2", "label2");
        const bcArr : BuildConfigItem[] = [buildConfig, buildConfig2];
        const patchSender : TccPatchSender = new TccPatchSender();
        assert.equal(patchSender.getTestObject().configArray2String(bcArr), `"id,id2"`);
    });

    test("should verify TccPatchSender filePaths2String", function() {
        const patchSender : TccPatchSender = new TccPatchSender();

        assert.equal(patchSender.getTestObject().filePaths2String(["path1:/to/file", "path2:/to/file"]), `"path1:/to/file" "path2:/to/file"`);
    });
});
