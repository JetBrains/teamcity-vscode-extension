"use strict";

import { assert } from "chai";
import xmlrpc = require("xmlrpc");
import { ProjectItem } from "../../src/entities/projectitem";
import { BuildConfigItem } from "../../src/entities/leaveitems";
import { XmlRpcBuildConfigResolver } from "../../src/remoterun/buildconfigresolver";

suite("BuildConfigResolver", () => {

    test("should verify XmlRpcBuildConfigResolver parseXml", function() {
        const fakeXmlResponse : string[] = [];
        fakeXmlResponse.push(`<Project><myProjectId>_Root</myProjectId><myExternalId>_Root</myExternalId><name>&lt;Root project&gt;</name><desc>Contains all other projects</desc><status>1</status><configs/></Project>`);
        fakeXmlResponse.push(`<Project><myProjectId>project2</myProjectId><myExternalId>JavaHelloWorld</myExternalId><myParentProjectId>_Root</myParentProjectId><name>JavaHelloWorld</name><desc></desc><status>1</status><configs><Configuration><queued>false</queued><id>bt3</id><myExternalId>JavaHelloWorld_JavaHelloWorld2</myExternalId><projectName>JavaHelloWorld</projectName><projectId>project2</projectId><myProjectExternalId>JavaHelloWorld</myProjectExternalId><myRunnerTypes class="list"><string>Maven2</string></myRunnerTypes><name>Java Hello World 2</name><checkoutType>AUTO</checkoutType><status reference="../../../status"/><myStatusDescriptor><myStatusDescriptor><myText>Success</myText><myStatus reference="../../../../../status"/></myStatusDescriptor><myBuildNumber>6</myBuildNumber><myBuildId>32</myBuildId></myStatusDescriptor><responsibility><comment></comment><since>1500287291137</since><myState>NONE</myState><myRemoveMethod>WHEN_FIXED</myRemoveMethod></responsibility><isLastFinishedLoaded>false</isLastFinishedLoaded><isLastSuccessfullyFinishedLoaded>false</isLastSuccessfullyFinishedLoaded><paused>false</paused></Configuration><Configuration><queued>false</queued><id>bt2</id><myExternalId>JavaHelloWorld_JavaHelloWorldBuild</myExternalId><projectName>JavaHelloWorld</projectName><projectId>project2</projectId><myProjectExternalId>JavaHelloWorld</myProjectExternalId><myRunnerTypes class="list"><string>Maven2</string></myRunnerTypes><name>Java Hello World Build</name><checkoutType>AUTO</checkoutType><status reference="../../../status"/><myStatusDescriptor><myStatusDescriptor><myText>Success</myText><myStatus reference="../../../../../status"/></myStatusDescriptor><myBuildNumber>4</myBuildNumber><myBuildId>14</myBuildId></myStatusDescriptor><responsibility><comment></comment><since>1500287291137</since><myState>NONE</myState><myRemoveMethod>WHEN_FIXED</myRemoveMethod></responsibility><isLastFinishedLoaded>false</isLastFinishedLoaded><isLastSuccessfullyFinishedLoaded>false</isLastSuccessfullyFinishedLoaded><paused>false</paused></Configuration></configs></Project>`);
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver("http://localhost");
        const projectsContainer : ProjectItem[] = confResolver.getTestObject().parseXml(fakeXmlResponse);
        assert.equal(projectsContainer[0].configs[1].label, "Java Hello World Build");
        assert.equal(projectsContainer[0].configs[0].label, "Java Hello World 2");
    });

    test("should verify XmlRpcBuildConfigResolver parseXml with empty projects", function() {
        const fakeXmlResponse : string[] = [];
        fakeXmlResponse.push(``);
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver("http://localhost");
        assert.equal(confResolver.getTestObject().parseXml(fakeXmlResponse).length, 0);
        assert.equal(confResolver.getTestObject().parseXml(undefined).length, 0);
    });

    test("should verify XmlRpcBuildConfigResolver filterConfigs", function(done) {
        const fakeXmlResponse : string[] = [];
        fakeXmlResponse.push(``);
        const confResolver : XmlRpcBuildConfigResolver = new XmlRpcBuildConfigResolver("http://localhost");
        const bc1 : BuildConfigItem = new BuildConfigItem("id1", "externalId1", "name1");
        const bc2 : BuildConfigItem = new BuildConfigItem("id2", "externalId2", "name2");
        const bc3 : BuildConfigItem = new BuildConfigItem("id3", "externalId3", "name3");
        const bc4 : BuildConfigItem = new BuildConfigItem("id4", "externalId4", "name4");
        const p1 : ProjectItem = new ProjectItem("p1", [bc1, bc2]);
        const p2 : ProjectItem = new ProjectItem("p2", [bc3, bc4]);
        const projectContainer : ProjectItem[] = [p1, p2];
        confResolver.getTestObject().filterConfigs(projectContainer, ["id1", "id2", "id4"]).then(() => {
            assert.equal(projectContainer[0].configs.length, 2);
            assert.equal(projectContainer[1].configs.length, 1);
            done();
        }).catch((err) => {
            assert.equal(true, false);
            done();
        });
    });

});
