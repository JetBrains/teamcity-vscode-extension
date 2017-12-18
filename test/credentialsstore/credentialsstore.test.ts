"use strict";

import {assert} from "chai";
import {Credentials} from "../../src/bll/credentialsstore/credentials";
import {InMemoryCredentialsStore} from "../../src/bll/credentialsstore/inmemorycredentialsstore";

suite("CredentialStore", function () {

    test("should verify constructor", function () {
        const cs: InMemoryCredentialsStore = new InMemoryCredentialsStore(undefined, undefined, undefined, undefined);
        assert.equal(cs.getCredentialsSilently(), undefined);
    });

    test("should verify set/getCredential", function () {
        const credentials: Credentials = new Credentials("http://localhost:8239", "user", "password", "1", "xxx");
        const cs: InMemoryCredentialsStore = new InMemoryCredentialsStore(undefined, undefined, undefined, undefined);
        cs.setCredentials(credentials);
        assert.equal(cs.getCredentialsSilently(), credentials);
    });

    test("should verify set/getCredential - rewriting", function () {
        const credentials: Credentials = new Credentials("http://localhost:7239", "user", "password", "1", "xxx");
        const credentials2: Credentials = new Credentials("http://localhost:4239", "user2", "password2", "2", "yyy");
        const cs: InMemoryCredentialsStore = new InMemoryCredentialsStore(undefined, undefined, undefined, undefined);
        cs.setCredentials(credentials);
        cs.setCredentials(credentials2);
        assert.equal(cs.getCredentialsSilently(), credentials2);
    });

    test("should verify removeCredential", function () {
        const credentials: Credentials = new Credentials("http://localhost", "user", "password", "1", "xxx");
        const cs: InMemoryCredentialsStore = new InMemoryCredentialsStore(undefined, undefined, undefined, undefined);
        cs.setCredentials(credentials);
        cs.removeCredentials();
        assert.equal(cs.getCredentialsSilently(), undefined);
    });
});
