import {assert} from "chai";
import {BuildConfig} from "../../../src/bll/entities/buildconfig";

suite("BuildConfig", () => {
    test("should verify BuildConfig constructor", function () {
        const buildConfig: BuildConfig = new BuildConfig("id", "externalId", "name");
        assert.equal(buildConfig.id, "id");
        assert.equal(buildConfig.externalId, "externalId");
        assert.equal(buildConfig.name, "name");
    });

    test("should verify BuildConfig incorrect constructor", function () {
        const buildConfig: BuildConfig = new BuildConfig(undefined, undefined, undefined);
        assert.equal(buildConfig.id, undefined);
        assert.equal(buildConfig.externalId, undefined);
        assert.equal(buildConfig.name, undefined);
    });
});
