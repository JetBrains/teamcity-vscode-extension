import {assert} from "chai";
import {Settings} from "../../../src/bll/entities/settings";
import {SettingsImpl} from "../../../src/bll/entities/settingsimpl";

suite("Settings", () => {

    test("should verify construction", function () {
        const settings: Settings = new SettingsImpl();
        assert.isObject(settings);
    });

    test("should verify setting false showSignInWelcome property", function (done) {
        const settings: Settings = new SettingsImpl();
        const temp = settings.showSignInWelcome;
        settings.setShowSignInWelcome(false).then(() => {
            const settings: Settings = new SettingsImpl();
            assert.equal(settings.showSignInWelcome, false);
            settings.setShowSignInWelcome(temp).then(() => {
                done();
            }).catch((err) => {
                done(err);
            });
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify setting true showSignInWelcome property", function (done) {
        const settings: Settings = new SettingsImpl();
        const temp = settings.showSignInWelcome;
        settings.setShowSignInWelcome(true).then(() => {
            const settings: Settings = new SettingsImpl();
            assert.equal(settings.showSignInWelcome, true);
            settings.setShowSignInWelcome(temp).then(() => {
                done();
            }).catch((err) => {
                done(err);
            });
        }).catch((err) => {
            done(err);
        });
    });
});
