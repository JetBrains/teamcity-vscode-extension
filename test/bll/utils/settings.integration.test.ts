import {assert} from "chai";
import {Settings} from "../../../src/bll/entities/settings";
import {SettingsImpl} from "../../../src/bll/entities/settingsimpl";

suite("Settings", () => {

    test("should verify construction", function () {
        const settings: Settings = new SettingsImpl();
        assert.isObject(settings);
    });
});
