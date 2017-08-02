"use strict";

import { assert } from "chai";
import { SettingsImpl, Settings } from "../../src/utils/settings";
import * as http from "http";

suite("Settings", () => {

    test("should verify construction", function() {
        const settings : Settings = new SettingsImpl();
        assert.isObject(settings);
    });

    test("should verify nonexistent key", function() {
        const settings : SettingsImpl = new SettingsImpl();
        const result : SettingsImpl = settings.getTestObject().getSettingsProperty("abra-kadabra-2000", undefined);
        assert.isUndefined(result);
    });

    test("should verify default string value", function() {
        const settings : SettingsImpl = new SettingsImpl();
        const particularValue : string = "particularValue";
        const result : string = settings.getTestObject().getSettingsProperty("abra-kadabra-2000", particularValue);
        assert.equal(result, particularValue);
    });

    test("should verify default boolean value", function() {
        const settings : SettingsImpl = new SettingsImpl();
        const particularValue : boolean = true;
        const result : boolean = settings.getTestObject().getSettingsProperty("abra-kadabra-2000", particularValue);
        assert.equal(result, particularValue);
    });

    test("should verify setting false showSignInWelcome property", function(done) {
        const settings : Settings = new SettingsImpl();
        const temp = settings.showSignInWelcome;
        settings.setShowSignInWelcome(false).then(() => {
            const settings : Settings = new SettingsImpl();
            assert.equal(settings.showSignInWelcome, false);
            settings.setShowSignInWelcome(temp);
            done();
        });
    });

    test("should verify setting true showSignInWelcome property", function(done) {
        const settings : Settings = new SettingsImpl();
        const temp = settings.showSignInWelcome;
        settings.setShowSignInWelcome(true).then(() => {
            const settings : Settings = new SettingsImpl();
            assert.equal(settings.showSignInWelcome, true);
            settings.setShowSignInWelcome(temp);
            done();
        });

    });
});
