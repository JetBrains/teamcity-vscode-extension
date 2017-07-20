"use strict";

import { assert, expect } from "chai";
import { Credential } from "../../src/credentialstore/credential";
import { BuildConfigResolver, XmlRpcBuildConfigResolver } from "../../src/teamcityapi/buildconfigresolver";
import { BuildConfig } from "../../src/remoterun/configexplorer";
import xmlrpc = require("xmlrpc");

suite("BuildConfigResolver", () => {
    test("should verify XmlRpcBuildConfigResolver constructor", function() {
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver();
        assert.equal(confResolver.getTestObject()._cred, undefined);
        assert.equal(confResolver.getTestObject()._xmlRpcClient, undefined);
    });

    test("should verify XmlRpcBuildConfigResolver extractKeys", function() {
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver();
        const key = confResolver.getTestObject().extractKeys("qwerrtyu:12345678");
        assert.equal(key[0], "qwerrtyu");
        assert.equal(key[1], "12345678");
    });

    test("should verify XmlRpcBuildConfigResolver extractKeys - incorrect value", function() {
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver();
        assert.equal(confResolver.getTestObject().extractKeys("qwerrtyu12345678"), undefined);
        assert.equal(confResolver.getTestObject().extractKeys("qwerrtyu:12345678:zxcvbnmb"), undefined);
    });

    test("should verify XmlRpcBuildConfigResolver collectConfigs", function() {
        const fakeXmlResponse : string[] = [];
        fakeXmlResponse.push(`<Project><myProjectId>_Root</myProjectId><myExternalId>_Root</myExternalId><name>&lt;Root project&gt;</name><desc>Contains all other projects</desc><status>1</status><configs/></Project>`);
        fakeXmlResponse.push(`<Project><myProjectId>project2</myProjectId><myExternalId>JavaHelloWorld</myExternalId><myParentProjectId>_Root</myParentProjectId><name>JavaHelloWorld</name><desc></desc><status>1</status><configs><Configuration><queued>false</queued><id>bt3</id><myExternalId>JavaHelloWorld_JavaHelloWorld2</myExternalId><projectName>JavaHelloWorld</projectName><projectId>project2</projectId><myProjectExternalId>JavaHelloWorld</myProjectExternalId><myRunnerTypes class="list"><string>Maven2</string></myRunnerTypes><name>Java Hello World 2</name><checkoutType>AUTO</checkoutType><status reference="../../../status"/><myStatusDescriptor><myStatusDescriptor><myText>Success</myText><myStatus reference="../../../../../status"/></myStatusDescriptor><myBuildNumber>6</myBuildNumber><myBuildId>32</myBuildId></myStatusDescriptor><responsibility><comment></comment><since>1500287291137</since><myState>NONE</myState><myRemoveMethod>WHEN_FIXED</myRemoveMethod></responsibility><isLastFinishedLoaded>false</isLastFinishedLoaded><isLastSuccessfullyFinishedLoaded>false</isLastSuccessfullyFinishedLoaded><paused>false</paused></Configuration><Configuration><queued>false</queued><id>bt2</id><myExternalId>JavaHelloWorld_JavaHelloWorldBuild</myExternalId><projectName>JavaHelloWorld</projectName><projectId>project2</projectId><myProjectExternalId>JavaHelloWorld</myProjectExternalId><myRunnerTypes class="list"><string>Maven2</string></myRunnerTypes><name>Java Hello World Build</name><checkoutType>AUTO</checkoutType><status reference="../../../status"/><myStatusDescriptor><myStatusDescriptor><myText>Success</myText><myStatus reference="../../../../../status"/></myStatusDescriptor><myBuildNumber>4</myBuildNumber><myBuildId>14</myBuildId></myStatusDescriptor><responsibility><comment></comment><since>1500287291137</since><myState>NONE</myState><myRemoveMethod>WHEN_FIXED</myRemoveMethod></responsibility><isLastFinishedLoaded>false</isLastFinishedLoaded><isLastSuccessfullyFinishedLoaded>false</isLastSuccessfullyFinishedLoaded><paused>false</paused></Configuration></configs></Project>`);
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver();
        const cb : BuildConfig[] = confResolver.getTestObject().collectConfigs(fakeXmlResponse);
        assert.equal(cb["bt2"], "[JavaHelloWorld] Java Hello World Build");
        assert.equal(cb["bt3"], "[JavaHelloWorld] Java Hello World 2");
    });

    test("should verify XmlRpcBuildConfigResolver collectConfigs with empty projects", function() {
        const fakeXmlResponse : string[] = [];
        fakeXmlResponse.push(``);
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver();
        assert.equal(confResolver.getTestObject().collectConfigs(fakeXmlResponse).length, 0);
        assert.equal(confResolver.getTestObject().collectConfigs(undefined).length, 0);
    });

});
