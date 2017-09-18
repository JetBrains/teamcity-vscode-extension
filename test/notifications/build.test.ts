"use strict";

import {assert} from "chai";
import * as xml2js from "xml2js";
import {Build} from "../../src/bll/entities/build";

suite("BuildItemProxy", () => {
    test("should verify constructor/buildId", function (done) {
        xml2js.parseString(personalBuildObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of personalBuildObjXml.");
            }
            const buildItem: Build = Build.fromXmlRpcObject(obj.Build);
            assert.equal(buildItem.id, 134);
            done();
        });
    });

    test("should verify is Personal", function (done) {
        xml2js.parseString(personalBuildObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of personalBuildObjXml.");
            }
            const buildItem: Build = Build.fromXmlRpcObject(obj.Build);
            assert.equal(buildItem.isPersonal, true);
            done();
        });
    });

    test("should verify is not Personal", function (done) {
        xml2js.parseString(nonPersonalBuildObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of personalBuildObjXml.");
            }
            const buildItem: Build = Build.fromXmlRpcObject(obj.Build);
            assert.equal(buildItem.isPersonal, false);
            done();
        });
    });

    test("should verify status", function (done) {
        xml2js.parseString(personalBuildObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of personalBuildObjXml.");
            }
            const buildItem: Build = Build.fromXmlRpcObject(obj.Build);
            assert.equal(buildItem.status, "Success");
            done();
        });
    });
});

const personalBuildObjXml = `<Build>
    <start>1500628294505</start>
    <finish>1500628298430</finish>
    <agent>UNIT-1028</agent>
    <id>134</id>
    <estimationTimeLeft>-1</estimationTimeLeft>
    <statusDescriptor>
    <myText>Success</myText>
    <myStatus reference="../../../../../../../projects/Project/status"/>
    </statusDescriptor>
    <personal>true</personal>
    <number>64</number>
    <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
    <myDuration>3</myDuration>
</Build>`;

const nonPersonalBuildObjXml = `<Build>
    <start>1500628294505</start>
    <finish>1500628298430</finish>
    <agent>UNIT-1028</agent>
    <id>134</id>
    <estimationTimeLeft>-1</estimationTimeLeft>
    <statusDescriptor>
    <myText>Success</myText>
    <myStatus reference="../../../../../../../projects/Project/status"/>
    </statusDescriptor>
    <personal>false</personal>
    <number>64</number>
    <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
    <myDuration>3</myDuration>
</Build>`;
