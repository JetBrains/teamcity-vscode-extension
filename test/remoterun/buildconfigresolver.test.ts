"use strict";

import { assert, expect } from "chai";
import { Credential } from "../../src/credentialstore/credential";
import { BuildConfigResolver, XmlRpcBuildConfigResolver } from "../../src/remoterun/buildconfigresolver";
import { BuildConfig } from "../../src/remoterun/configexplorer";
import xmlrpc = require("xmlrpc");

suite("BuildConfigResolver", () => {
    test("should verify XmlRpcBuildConfigResolver constructor", function() {
        const creds: Credential = new Credential("http://localhost:7239/", "user", "password");
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver(creds);
        assert.equal(confResolver.getTestObject()._creds, creds);
        assert.equal(confResolver.getTestObject()._xmlRpcClient !== undefined, true);
    });

    test("should verify XmlRpcBuildConfigResolver constructor with undefined arg", function() {
        expect(function(){new XmlRpcBuildConfigResolver(undefined)}).to.throw('Credential should not be undefined.');
        
    });
    
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
    
    test("should verify XmlRpcBuildConfigResolver collectConfigs", function() {
        const fakeXmlResponse : string[] = [];
        fakeXmlResponse.push(`<Project><myProjectId>_Root</myProjectId><myExternalId>_Root</myExternalId><name>&lt;Root project&gt;</name><desc>Contains all other projects</desc><status>1</status><configs/></Project>`);
        fakeXmlResponse.push(`<Project><myProjectId>project2</myProjectId><myExternalId>JavaHelloWorld</myExternalId><myParentProjectId>_Root</myParentProjectId><name>JavaHelloWorld</name><desc></desc><status>1</status><configs><Configuration><queued>false</queued><id>bt3</id><myExternalId>JavaHelloWorld_JavaHelloWorld2</myExternalId><projectName>JavaHelloWorld</projectName><projectId>project2</projectId><myProjectExternalId>JavaHelloWorld</myProjectExternalId><myRunnerTypes class="list"><string>Maven2</string></myRunnerTypes><name>Java Hello World 2</name><checkoutType>AUTO</checkoutType><status reference="../../../status"/><myStatusDescriptor><myStatusDescriptor><myText>Success</myText><myStatus reference="../../../../../status"/></myStatusDescriptor><myBuildNumber>6</myBuildNumber><myBuildId>32</myBuildId></myStatusDescriptor><responsibility><comment></comment><since>1500287291137</since><myState>NONE</myState><myRemoveMethod>WHEN_FIXED</myRemoveMethod></responsibility><isLastFinishedLoaded>false</isLastFinishedLoaded><isLastSuccessfullyFinishedLoaded>false</isLastSuccessfullyFinishedLoaded><paused>false</paused></Configuration><Configuration><queued>false</queued><id>bt2</id><myExternalId>JavaHelloWorld_JavaHelloWorldBuild</myExternalId><projectName>JavaHelloWorld</projectName><projectId>project2</projectId><myProjectExternalId>JavaHelloWorld</myProjectExternalId><myRunnerTypes class="list"><string>Maven2</string></myRunnerTypes><name>Java Hello World Build</name><checkoutType>AUTO</checkoutType><status reference="../../../status"/><myStatusDescriptor><myStatusDescriptor><myText>Success</myText><myStatus reference="../../../../../status"/></myStatusDescriptor><myBuildNumber>4</myBuildNumber><myBuildId>14</myBuildId></myStatusDescriptor><responsibility><comment></comment><since>1500287291137</since><myState>NONE</myState><myRemoveMethod>WHEN_FIXED</myRemoveMethod></responsibility><isLastFinishedLoaded>false</isLastFinishedLoaded><isLastSuccessfullyFinishedLoaded>false</isLastSuccessfullyFinishedLoaded><paused>false</paused></Configuration></configs></Project>`);
        const creds: Credential = new Credential("http://localhost:7239/", "user", "password");
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver(creds);
        const cb : BuildConfig[] = confResolver.getTestObject().collectConfigs(fakeXmlResponse);
        assert.equal(cb["bt2"], "[JavaHelloWorld] Java Hello World Build");
        assert.equal(cb["bt3"], "[JavaHelloWorld] Java Hello World 2");
    });

    test("should verify XmlRpcBuildConfigResolver collectConfigs with empty projects", function() {
        const fakeXmlResponse : string[] = [];
        fakeXmlResponse.push(``);
        const creds: Credential = new Credential("http://localhost:7239/", "user", "password");
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver(creds);
        assert.equal(confResolver.getTestObject().collectConfigs(fakeXmlResponse).length, 0);
        assert.equal(confResolver.getTestObject().collectConfigs(undefined).length, 0);
    });

});