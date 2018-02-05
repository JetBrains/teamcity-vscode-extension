"use strict";

import {assert} from "chai";
import * as xml2js from "xml2js";
import {Change} from "../../../src/bll/entities/change";

suite("ChangeItemProxy", () => {
    test("should verify constructor/changeId", function (done) {
        xml2js.parseString(changePersonalObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of changePersonalObjXml.");
            }
            const changeItem: Change = Change.fromXmlRpcObject(obj.ChangeInfo);
            assert.equal(changeItem.id, 61);
            done();
        });
    });

    test("should verify is Personal", function (done) {
        xml2js.parseString(changePersonalObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of changePersonalObjXml.");
            }
            const changeItem: Change = Change.fromXmlRpcObject(obj.ChangeInfo);
            assert.equal(changeItem.isPersonal, true);
            done();
        });
    });

    test("should verify is not Personal", function (done) {
        xml2js.parseString(changeNonPersonalObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of changePersonalObjXml.");
            }
            const changeItem: Change = Change.fromXmlRpcObject(obj.ChangeInfo);
            assert.equal(changeItem.isPersonal, false);
            done();
        });
    });

    test("should verify status", function (done) {
        xml2js.parseString(changePersonalObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of changePersonalObjXml.");
            }
            const changeItem: Change = Change.fromXmlRpcObject(obj.ChangeInfo);
            assert.equal(changeItem.status, "CHECKED");
            done();
        });
    });

    test("should verify builds", function (done) {
        xml2js.parseString(changePersonalObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of changePersonalObjXml.");
            }
            const changeItem: Change = Change.fromXmlRpcObject(obj.ChangeInfo);
            assert.equal(changeItem.builds.length, 1);
            assert.equal(changeItem.builds[0].id, 87);
            done();
        });
    });
});

const changePersonalObjXml: string = `<ChangeInfo>
    <mod>
    <myVcsDate>1500457539333</myVcsDate>
    <myVersion>19 07 2017 12:45</myVersion>
    <myDisplayVersion>19 07 2017 12:45</myDisplayVersion>
    <myUser>rugpanov</myUser>
    <myDescription></myDescription>
    <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
    <myChangesCount>5</myChangesCount>
    <myCanBeIgnored>true</myCanBeIgnored>
    <id>61</id>
    <personal>true</personal>
    <myVersionControlName>Pre-Tested Commit</myVersionControlName>
    </mod>
    <myTypeToInstanceMap class="linked-hash-map">
    <entry>
        <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
        <Build>
        <start>1500457541285</start>
        <finish>1500457552884</finish>
        <agent>UNIT-1028</agent>
        <id>87</id>
        <estimationTimeLeft>-1</estimationTimeLeft>
        <statusDescriptor>
            <myText>Success</myText>
            <myStatus reference="../../../../../../../projects/Project/status"/>
        </statusDescriptor>
        <personal>true</personal>
        <number>1</number>
        <configuration reference="../../../../../../projects/Project[3]/configs/Configuration"/>
        <myDuration>11</myDuration>
        </Build>
    </entry>
    </myTypeToInstanceMap>
    <fixed class="linked-hash-map">
    <entry>
        <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
        <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
    </entry>
    </fixed>
    <current class="linked-hash-map">
    <entry>
        <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
        <null/>
    </entry>
    </current>
    <users class="java.util.Collections$SingletonList">
    <element class="long">1</element>
    </users>
    <myPersonalDesc>
    <myId>61</myId>
    <myUserId>1</myUserId>
    <myCommitType>1</myCommitType>
    <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
    <myCommitDecision>COMMIT</myCommitDecision>
    </myPersonalDesc>
    <myStatus>CHECKED</myStatus>
</ChangeInfo>`;

const changeNonPersonalObjXml: string = `<ChangeInfo>
    <mod>
    <myVcsDate>1500895071000</myVcsDate>
    <myVersion>cc898a2ce6b33ce1bc1c70b343dd8fc4cd1486da</myVersion>
    <myDisplayVersion>cc898a2ce6b33ce1bc1c70b343dd8fc4cd1486da</myDisplayVersion>
    <myUser>gripanov</myUser>
    <myDescription>Some test commit
</myDescription>
    <myChanges class="java.util.Collections$EmptyList"/>
    <myChangesCount>1</myChangesCount>
    <myCanBeIgnored>true</myCanBeIgnored>
    <id>23</id>
    <personal>false</personal>
    <myVersionControlName>Git</myVersionControlName>
    </mod>
    <myTypeToInstanceMap class="linked-hash-map">
    <entry>
        <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
        <Build>
        <start>1500895147485</start>
        <finish>1500895151619</finish>
        <agent>UNIT-1028</agent>
        <id>153</id>
        <estimationTimeLeft>-1</estimationTimeLeft>
        <statusDescriptor>
            <myText>Success</myText>
            <myStatus reference="../../../../../../../projects/Project/status"/>
        </statusDescriptor>
        <personal>false</personal>
        <number>70</number>
        <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
        <myDuration>4</myDuration>
        </Build>
    </entry>
    </myTypeToInstanceMap>
    <fixed class="linked-hash-map">
    <entry>
        <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
        <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
    </entry>
    </fixed>
    <current class="linked-hash-map">
    <entry>
        <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
        <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
    </entry>
    </current>
    <users>
    <long>1</long>
    </users>
    <myStatus>CHECKED</myStatus>
</ChangeInfo>`;
