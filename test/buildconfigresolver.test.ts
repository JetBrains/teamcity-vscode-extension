"use strict";

import { assert } from "chai";
import { Credential } from "../src/credentialstore/credential";
import { BuildConfigResolver, XmlRpcBuildConfigResolver } from "../src/buildconfigresolver";
import xmlrpc = require("xmlrpc");

suite("BuildConfigResolver", () => {
    test("should verify XmlRpcBuildConfigResolver extractKeys", function() {
        const creds: Credential = new Credential("http://localhost:7239/", "user", "password");
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver(creds);
        const key = confResolver.getTestObject().extractKeys("qwerrtyu:12345678");
        assert.equal(key[0], "qwerrtyu");
        assert.equal(key[1], "12345678");
    });

    test("should verify XmlRpcBuildConfigResolver extractKeys - incorrect value", function() {
        const creds: Credential = new Credential("http://localhost:7239/", "user", "password");
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver(creds);
        assert.isNull(confResolver.getTestObject().extractKeys("qwerrtyu12345678"));
        assert.isNull(confResolver.getTestObject().extractKeys("qwerrtyu:12345678:zxcvbnmb"));
    });

    test("should verify XmlRpcBuildConfigResolver extractKeys - incorrect value", function() {
        const creds: Credential = new Credential("http://localhost:7239/", "user", "password");
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver(creds);
        assert.isNull(confResolver.getTestObject().extractKeys("qwerrtyu12345678"));
        assert.isNull(confResolver.getTestObject().extractKeys("qwerrtyu:12345678:zxcvbnmb"));
    });
    
    //Error: Timeout of 2000ms exceeded. For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves.  
    // test("should verify XmlRpcBuildConfigResolver extractKeys - incorrect value", function(done) {
    //     // Creates an XML-RPC server to listen to XML-RPC method calls
    //     const creds: Credential = new Credential("http://localhost:6239", "user", "password");
    //     var server = xmlrpc.createServer({ url: creds.serverURL })
    //     server.on('NotFound', function(method, params) {
    //         console.log('Method ' + method + ' does not exist');
    //     })
    //     server.on('RemoteAuthenticationServer.getPublicKey', function (err, params, callback) {
    //         console.log('Method call params for \'anAction\': ' + params)
    //         callback(null, 'aResult')
    //     })
    //     console.log('XML-RPC server listening on port 6239');

    //     const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver(creds);
    //     setTimeout(function () {
    //         confResolver.getTestObject().getRSAPublicKey().then((data) => {
    //             console.log(data);
    //             assert.equal(data, "2344")
    //             done();
    //         });
    //     }, 1000);     
    // });
});