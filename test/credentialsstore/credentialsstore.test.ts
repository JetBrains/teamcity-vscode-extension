"use strict";

const http = require("http");
import { assert } from "chai";
import { Credentials } from "../../src/credentialsstore/credentials";
import { CredentialsStore } from "../../src/credentialsstore/credentialsstore";

suite("CredentialStore", function() {

    test("should verify constructor", function() {
        const cs : CredentialsStore = new CredentialsStore();
        assert.equal(cs.getCredential(), undefined);
    });

    test("should verify set/getCredential", function(done) {
        const credentials: Credentials = new Credentials("http://localhost:8239", "user", "password");
        const cs : CredentialsStore = new CredentialsStore();
        const serv = http.createServer(function (req, res) {
            serv.close();
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end();
        }).listen(8239);
        cs.setCredential(credentials).then(() => {
            assert.equal(cs.getCredential(), credentials);
            done();
        });
    });

    test("should verify set/getCredential - rewriting", function(done) {
        const credentials: Credentials = new Credentials("http://localhost:7239", "user", "password");
        const credentials2: Credentials = new Credentials("http://localhost:4239", "user2", "password2");
        const cs : CredentialsStore = new CredentialsStore();
        const serv = http.createServer(function (req, res) {
            serv.close();
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end();
        }).listen(7239);
        const serv2 = http.createServer(function (req, res) {
            serv.close();
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end();
        }).listen(4239);
        cs.setCredential(credentials).then(() => {
            cs.setCredential(credentials2).then(() => {
                assert.equal(cs.getCredential(), credentials2);
                done();
            });
        });
    });

    test("should verify removeCredential", function() {
        const credentials: Credentials = new Credentials("http://localhost", "user", "password");
        const cs : CredentialsStore = new CredentialsStore();
        cs.setCredential(credentials);
        cs.removeCredential();
        assert.equal(cs.getCredential(), undefined);
    });
});
