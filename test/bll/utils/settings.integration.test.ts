import {assert} from "chai";
import {Settings} from "../../../src/bll/entities/settings";
import {SettingsImpl} from "../../../src/bll/entities/settingsimpl";

suite("Settings", () => {

    test("should verify construction", function () {
        const settings: Settings = new SettingsImpl();
        assert.isObject(settings);
    });

    test("should verify setting value to showSignInWelcome property", function (done) {
        const settings: Settings = new SettingsImpl();
        const temp = settings.showSignInWelcome;
        const expectedValue = !temp;
        settings.showSignInWelcome = expectedValue;
        setTimeout(() => {
            const settings: Settings = new SettingsImpl();
            assert.equal(settings.showSignInWelcome, expectedValue);
            settings.showSignInWelcome = temp;
            setTimeout(() => {
                const settings: Settings = new SettingsImpl();
                assert.equal(settings.showSignInWelcome, temp);
                done();
            },         350);
        },         350);

    });
});
