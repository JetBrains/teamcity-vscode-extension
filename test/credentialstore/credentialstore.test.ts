"use strict";

import { assert } from "chai";
import { Credential } from "../../src/credentialstore/credential";
import { CredentialStore } from "../../src/credentialstore/credentialstore";
var http = require("http");

suite("CredentialStore", function() {

    test("should verify constructor", function() {
        const cs : CredentialStore = new CredentialStore();
        assert.equal(cs.getCredential(), undefined);
    });

    test("should verify set/getCredential", function() {
        const creds: Credential = new Credential("http://localhost:8239", "user", "password");
        const cs : CredentialStore = new CredentialStore();
        const serv = http.createServer(function (req, res) {
            serv.close();
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end();
        }).listen(8239); 
        cs.setCredential(creds).then(()=>{
            assert.equal(cs.getCredential(), creds);
        });
    });

    test("should verify set/getCredential - rewriting", function() {
        const creds: Credential = new Credential("http://localhost:7239/", "user", "password");
        const creds2: Credential = new Credential("http://localhost:7239/", "user2", "password2");
        const cs : CredentialStore = new CredentialStore();
        const serv = http.createServer(function (req, res) {
            serv.close();
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(); 
        }).listen(7239); 
        cs.setCredential(creds).then(() => {
            cs.setCredential(creds2).then(() => {
                assert.equal(cs.getCredential(),creds2);
            });
        });
    });

    test("should verify removeCredential", function() {
        const creds: Credential = new Credential("http://localhost/", "user", "password");
        const cs : CredentialStore = new CredentialStore();
        cs.setCredential(creds);
        cs.removeCredential();
        assert.equal(cs.getCredential(), undefined);
    });
});

