"use strict";

import { assert } from "chai";
import { Credential } from "../../src/credentialstore/credential";

suite("Credential", () => {
    test("should verify constructor", function() {
        const creds: Credential = new Credential("http://localhost/", "user", "password");
        assert.equal(creds.serverURL, "http://localhost/");
        assert.equal(creds.user, "user");
        assert.equal(creds.pass, "password");
    });

    test("should verify constructor - with undefined param", function() {
        const creds: Credential = new Credential("http://localhost/", "user", undefined);
        assert.equal(creds.serverURL, "http://localhost/");
        assert.equal(creds.user, "user");
        assert.equal(creds.pass, undefined);
    });
});
