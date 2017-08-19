"use strict";

import { assert } from "chai";
import { Credentials } from "../../src/credentialsstore/credentials";

suite("Credential", () => {
    test("should verify constructor", function() {
        const credentials: Credentials = new Credentials("http://localhost/", "user", "password");
        assert.equal(credentials.serverURL, "http://localhost/");
        assert.equal(credentials.user, "user");
        assert.equal(credentials.pass, "password");
    });

    test("should verify constructor - with undefined param", function() {
        const credentials: Credentials = new Credentials("http://localhost/", "user", undefined);
        assert.equal(credentials.serverURL, "http://localhost/");
        assert.equal(credentials.user, "user");
        assert.equal(credentials.pass, undefined);
    });
});
