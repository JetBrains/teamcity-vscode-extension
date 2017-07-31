"use strict";

import { assert } from "chai";
import { SummaryDataProxy, ChangeItemProxy, BuildItemProxy } from "../../src/notifications/summarydata";
import * as xml2js from "xml2js";

suite("SummaryDataProxy", () => {
    test("should verify constructor", function(done) {
        xml2js.parseString(summaryObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of summaryObjXml.");
            }
            const summeryData : SummaryDataProxy = new SummaryDataProxy(obj.Summary);
            assert.equal(summeryData.getVisibleProjectIds.length, 2);
            done();
        });
    });

    test("should verify getVisibleProjectIds", function(done) {
        xml2js.parseString(summaryObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of summaryObjXml.");
            }
            const summeryData : SummaryDataProxy = new SummaryDataProxy(obj.Summary);
            assert.equal(summeryData.getVisibleProjectIds[0], "_Root");
            assert.equal(summeryData.getVisibleProjectIds[1], "project2");
            assert.equal(summeryData.getVisibleProjectIds.length, 2);
            done();
        });
    });

    test("should verify changes", function(done) {
        xml2js.parseString(summaryObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of summaryObjXml.");
            }
            const summeryData : SummaryDataProxy = new SummaryDataProxy(obj.Summary);
            assert.equal(summeryData.changes.length, 11);
            done();
        });
    });

    test("should verify personalChanges", function(done) {
        xml2js.parseString(summaryObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of summaryObjXml.");
            }
            const summeryData : SummaryDataProxy = new SummaryDataProxy(obj.Summary);
            assert.equal(summeryData.personalChanges.length, 102);
            done();
        });
    });
});

suite("ChangeItemProxy", () => {
    test("should verify constructor/changeId", function(done) {
        xml2js.parseString(changePersonalObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of changePersonalObjXml.");
            }
            const changeItem : ChangeItemProxy = new ChangeItemProxy(obj.ChangeInfo);
            assert.equal(changeItem.changeId, 61);
            done();
        });
    });

    test("should verify is Personal", function(done) {
        xml2js.parseString(changePersonalObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of changePersonalObjXml.");
            }
            const changeItem : ChangeItemProxy = new ChangeItemProxy(obj.ChangeInfo);
            assert.equal(changeItem.isPersonal, true);
            done();
        });
    });

    test("should verify is not Personal", function(done) {
        xml2js.parseString(changeNonPersonalObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of changePersonalObjXml.");
            }
            const changeItem : ChangeItemProxy = new ChangeItemProxy(obj.ChangeInfo);
            assert.equal(changeItem.isPersonal, false);
            done();
        });
    });

    test("should verify status", function(done) {
        xml2js.parseString(changePersonalObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of changePersonalObjXml.");
            }
            const changeItem : ChangeItemProxy = new ChangeItemProxy(obj.ChangeInfo);
            assert.equal(changeItem.status, "CHECKED");
            done();
        });
    });

    test("should verify builds", function(done) {
        xml2js.parseString(changePersonalObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of changePersonalObjXml.");
            }
            const changeItem : ChangeItemProxy = new ChangeItemProxy(obj.ChangeInfo);
            assert.equal(changeItem.builds.length, 1);
            assert.equal(changeItem.builds[0].buildId, 87);
            done();
        });
    });
});

suite("BuildItemProxy", () => {
    test("should verify constructor/buildId", function(done) {
        xml2js.parseString(personalBuildObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of personalBuildObjXml.");
            }
            const buildItem : BuildItemProxy = new BuildItemProxy(obj.Build);
            assert.equal(buildItem.buildId, 134);
            done();
        });
    });

    test("should verify is Personal", function(done) {
        xml2js.parseString(personalBuildObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of personalBuildObjXml.");
            }
            const buildItem : BuildItemProxy = new BuildItemProxy(obj.Build);
            assert.equal(buildItem.isPersonal, true);
            done();
        });
    });

    test("should verify is not Personal", function(done) {
        xml2js.parseString(nonPersonalBuildObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of personalBuildObjXml.");
            }
            const buildItem : BuildItemProxy = new BuildItemProxy(obj.Build);
            assert.equal(buildItem.isPersonal, false);
            done();
        });
    });

    test("should verify status", function(done) {
        xml2js.parseString(personalBuildObjXml, (err, obj) => {
            if (err) {
                done("Unexpected error during parse of personalBuildObjXml.");
            }
            const buildItem : BuildItemProxy = new BuildItemProxy(obj.Build);
            assert.equal(buildItem.status, "Success");
            done();
        });
    });
});

const summaryObjXml : string = `<Summary>
  <projects>
    <Project>
      <myProjectId>_Root</myProjectId>
      <myExternalId>_Root</myExternalId>
      <name>&lt;Root project&gt;</name>
      <desc>Contains all other projects</desc>
      <status>1</status>
      <configs/>
    </Project>
    <Project>
      <myProjectId>project2</myProjectId>
      <myExternalId>JavaHelloWorld</myExternalId>
      <myParentProjectId>_Root</myParentProjectId>
      <name>JavaHelloWorld</name>
      <desc></desc>
      <status reference="../../Project/status"/>
      <configs>
        <Configuration>
          <queued>false</queued>
          <id>bt3</id>
          <myExternalId>JavaHelloWorld_JavaHelloWorld2</myExternalId>
          <projectName>JavaHelloWorld</projectName>
          <projectId>project2</projectId>
          <myProjectExternalId>JavaHelloWorld</myProjectExternalId>
          <myRunnerTypes class="list">
            <string>Maven2</string>
          </myRunnerTypes>
          <name>Java Hello World 2</name>
          <checkoutType>AUTO</checkoutType>
          <status reference="../../../../Project/status"/>
          <myStatusDescriptor>
            <myStatusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../Project/status"/>
            </myStatusDescriptor>
            <myBuildNumber>73</myBuildNumber>
            <myBuildId>185</myBuildId>
          </myStatusDescriptor>
          <responsibility>
            <comment></comment>
            <since>1501086209511</since>
            <myState>NONE</myState>
            <myRemoveMethod>WHEN_FIXED</myRemoveMethod>
          </responsibility>
          <isLastFinishedLoaded>true</isLastFinishedLoaded>
          <lastFinished>
            <start>1501014959602</start>
            <finish>1501014963199</finish>
            <agent>UNIT-1028</agent>
            <id>185</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../Project/status"/>
            </statusDescriptor>
            <personal>false</personal>
            <number>73</number>
            <configuration reference="../.."/>
            <myDuration>3</myDuration>
          </lastFinished>
          <isLastSuccessfullyFinishedLoaded>true</isLastSuccessfullyFinishedLoaded>
          <lastSuccessfullyFinished reference="../lastFinished"/>
          <running/>
          <paused>false</paused>
        </Configuration>
        <Configuration>
          <queued>false</queued>
          <id>bt2</id>
          <myExternalId>JavaHelloWorld_JavaHelloWorldBuild</myExternalId>
          <projectName>JavaHelloWorld</projectName>
          <projectId>project2</projectId>
          <myProjectExternalId>JavaHelloWorld</myProjectExternalId>
          <myRunnerTypes class="list">
            <string>Maven2</string>
          </myRunnerTypes>
          <name>Java Hello World Build</name>
          <checkoutType>AUTO</checkoutType>
          <status reference="../../../../Project/status"/>
          <myStatusDescriptor>
            <myStatusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../Project/status"/>
            </myStatusDescriptor>
            <myBuildNumber>78</myBuildNumber>
            <myBuildId>183</myBuildId>
          </myStatusDescriptor>
          <responsibility>
            <comment></comment>
            <since>1501086209511</since>
            <myState>NONE</myState>
            <myRemoveMethod>WHEN_FIXED</myRemoveMethod>
          </responsibility>
          <isLastFinishedLoaded>true</isLastFinishedLoaded>
          <lastFinished>
            <start>1501014830383</start>
            <finish>1501014834181</finish>
            <agent>UNIT-1028</agent>
            <id>183</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../Project/status"/>
            </statusDescriptor>
            <personal>false</personal>
            <number>78</number>
            <configuration reference="../.."/>
            <myDuration>3</myDuration>
          </lastFinished>
          <isLastSuccessfullyFinishedLoaded>true</isLastSuccessfullyFinishedLoaded>
          <lastSuccessfullyFinished reference="../lastFinished"/>
          <running/>
          <paused>false</paused>
        </Configuration>
      </configs>
    </Project>
    <Project>
      <myProjectId>project3</myProjectId>
      <myExternalId>TfvcProject</myExternalId>
      <myParentProjectId>_Root</myParentProjectId>
      <name>Tfvc Project</name>
      <desc></desc>
      <status reference="../../Project/status"/>
      <configs>
        <Configuration>
          <queued>false</queued>
          <id>bt4</id>
          <myExternalId>TfvcProject_Build</myExternalId>
          <projectName>Tfvc Project</projectName>
          <projectId>project3</projectId>
          <myProjectExternalId>TfvcProject</myProjectExternalId>
          <myRunnerTypes class="list">
            <string>simpleRunner</string>
          </myRunnerTypes>
          <name>Build</name>
          <checkoutType>AUTO</checkoutType>
          <status reference="../../../../Project/status"/>
          <myStatusDescriptor>
            <myStatusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../Project/status"/>
            </myStatusDescriptor>
            <myBuildNumber>14</myBuildNumber>
            <myBuildId>144</myBuildId>
          </myStatusDescriptor>
          <responsibility>
            <comment></comment>
            <since>1501086209511</since>
            <myState>NONE</myState>
            <myRemoveMethod>WHEN_FIXED</myRemoveMethod>
          </responsibility>
          <isLastFinishedLoaded>false</isLastFinishedLoaded>
          <isLastSuccessfullyFinishedLoaded>false</isLastSuccessfullyFinishedLoaded>
          <paused>false</paused>
        </Configuration>
      </configs>
    </Project>
    <Project>
      <myProjectId>project1</myProjectId>
      <myExternalId>VSCodeHelloWorldExtension</myExternalId>
      <myParentProjectId>_Root</myParentProjectId>
      <name>VSCode Hello World Extension</name>
      <desc></desc>
      <status reference="../../Project/status"/>
      <configs>
        <Configuration>
          <queued>false</queued>
          <id>bt1</id>
          <myExternalId>VSCodeHelloWorldExtension_Build</myExternalId>
          <projectName>VSCode Hello World Extension</projectName>
          <projectId>project1</projectId>
          <myProjectExternalId>VSCodeHelloWorldExtension</myProjectExternalId>
          <myRunnerTypes class="list">
            <string>simpleRunner</string>
          </myRunnerTypes>
          <name>Build</name>
          <checkoutType>AUTO</checkoutType>
          <status reference="../../../../Project/status"/>
          <myStatusDescriptor>
            <myStatusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../Project/status"/>
            </myStatusDescriptor>
            <myBuildNumber>4</myBuildNumber>
            <myBuildId>4</myBuildId>
          </myStatusDescriptor>
          <responsibility>
            <comment></comment>
            <since>1501086209511</since>
            <myState>NONE</myState>
            <myRemoveMethod>WHEN_FIXED</myRemoveMethod>
          </responsibility>
          <isLastFinishedLoaded>false</isLastFinishedLoaded>
          <isLastSuccessfullyFinishedLoaded>false</isLastSuccessfullyFinishedLoaded>
          <paused>false</paused>
        </Configuration>
      </configs>
    </Project>
  </projects>
  <myFilteredOutProjectsWithInvetsigations/>
  <changes>
    <ChangeInfo>
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
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500894940000</myVcsDate>
        <myVersion>1b8c59c3c946424662130d79dd8370f3dfd5c307</myVersion>
        <myDisplayVersion>1b8c59c3c946424662130d79dd8370f3dfd5c307</myDisplayVersion>
        <myUser>gripanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>21</id>
        <personal>false</personal>
        <myVersionControlName>Git</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500894999612</start>
            <finish>1500895004797</finish>
            <agent>UNIT-1028</agent>
            <id>148</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>false</personal>
            <number>54</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>5</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </current>
      <users>
        <long>1</long>
      </users>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500631541000</myVcsDate>
        <myVersion>708cfbec96b2092822f597cad9ed9c5615183ab0</myVersion>
        <myDisplayVersion>708cfbec96b2092822f597cad9ed9c5615183ab0</myDisplayVersion>
        <myUser>gripanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../ChangeInfo/mod/myChanges"/>
        <myChangesCount>2</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>18</id>
        <personal>false</personal>
        <myVersionControlName>Git</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500631609356</start>
            <finish>1500631614438</finish>
            <agent>UNIT-1028</agent>
            <id>140</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>false</personal>
            <number>52</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>5</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </current>
      <users>
        <long>1</long>
      </users>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500628233000</myVcsDate>
        <myVersion>8cdde11baeb3f37e1e671efbfd9da3335fe1aa33</myVersion>
        <myDisplayVersion>8cdde11baeb3f37e1e671efbfd9da3335fe1aa33</myDisplayVersion>
        <myUser>gripanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../ChangeInfo/mod/myChanges"/>
        <myChangesCount>2</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>15</id>
        <personal>false</personal>
        <myVersionControlName>Git</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
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
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500565608000</myVcsDate>
        <myVersion>65529cc32da9f32ae311a774bfab973966ff0b61</myVersion>
        <myDisplayVersion>65529cc32da9f32ae311a774bfab973966ff0b61</myDisplayVersion>
        <myUser>gripanov</myUser>
        <myDescription>lalalalala
</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>10</id>
        <personal>false</personal>
        <myVersionControlName>Git</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500627547910</start>
            <finish>1500627553837</finish>
            <agent>UNIT-1028</agent>
            <id>119</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>false</personal>
            <number>43</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>5</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </current>
      <users>
        <long>1</long>
      </users>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500564949000</myVcsDate>
        <myVersion>0f8a139da2e4a4aaf2139c687f2861056c495f46</myVersion>
        <myDisplayVersion>0f8a139da2e4a4aaf2139c687f2861056c495f46</myDisplayVersion>
        <myUser>gripanov</myUser>
        <myDescription>lalalalala
</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>9</id>
        <personal>false</personal>
        <myVersionControlName>Git</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../../ChangeInfo[5]/myTypeToInstanceMap/entry/Build"/>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../../ChangeInfo[5]/myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../../ChangeInfo[5]/myTypeToInstanceMap/entry/Build"/>
        </entry>
      </current>
      <users>
        <long>1</long>
      </users>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499955938000</myVcsDate>
        <myVersion>0b44a524b60d8733a9e433129f2252c85502d14c</myVersion>
        <myDisplayVersion>0b44a524b60d8733a9e433129f2252c85502d14c</myDisplayVersion>
        <myUser>gripanov</myUser>
        <myDescription>some changes 2
</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>8</id>
        <personal>false</personal>
        <myVersionControlName>Git</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../../ChangeInfo[5]/myTypeToInstanceMap/entry/Build"/>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../../ChangeInfo[5]/myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../../ChangeInfo[5]/myTypeToInstanceMap/entry/Build"/>
        </entry>
      </current>
      <users>
        <long>1</long>
      </users>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499941504000</myVcsDate>
        <myVersion>d417948c5a3cca1cd073e4d476833ae6627a5ddb</myVersion>
        <myDisplayVersion>d417948c5a3cca1cd073e4d476833ae6627a5ddb</myDisplayVersion>
        <myUser>gripanov</myUser>
        <myDescription>Some changes
</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>7</id>
        <personal>false</personal>
        <myVersionControlName>Git</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../../ChangeInfo[5]/myTypeToInstanceMap/entry/Build"/>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../../ChangeInfo[5]/myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../../ChangeInfo[5]/myTypeToInstanceMap/entry/Build"/>
        </entry>
      </current>
      <users>
        <long>1</long>
      </users>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499781114000</myVcsDate>
        <myVersion>eb4729b05a6f807866f56a1055741467c45645dc</myVersion>
        <myDisplayVersion>eb4729b05a6f807866f56a1055741467c45645dc</myDisplayVersion>
        <myUser>gripanov</myUser>
        <myDescription>currently project can package
</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../ChangeInfo/mod/myChanges"/>
        <myChangesCount>8</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>4</id>
        <personal>false</personal>
        <myVersionControlName>Git</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499781154484</start>
            <finish>1499781157886</finish>
            <agent>UNIT-1028</agent>
            <id>13</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>false</personal>
            <number>3</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
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
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499779086000</myVcsDate>
        <myVersion>024642e9e5d182e7f092c5738eb6eb287f60d24c</myVersion>
        <myDisplayVersion>024642e9e5d182e7f092c5738eb6eb287f60d24c</myDisplayVersion>
        <myUser>gripanov</myUser>
        <myDescription>added some files
</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../ChangeInfo/mod/myChanges"/>
        <myChangesCount>9</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>3</id>
        <personal>false</personal>
        <myVersionControlName>Git</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499779172861</start>
            <finish>1499779176522</finish>
            <agent>UNIT-1028</agent>
            <id>12</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>false</personal>
            <number>2</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
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
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499776497000</myVcsDate>
        <myVersion>e5ee9f2ba20dc3cf11e0880220973873470c993c</myVersion>
        <myDisplayVersion>e5ee9f2ba20dc3cf11e0880220973873470c993c</myDisplayVersion>
        <myUser>gripanov</myUser>
        <myDescription>pom.xml was Added
</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>2</id>
        <personal>false</personal>
        <myVersionControlName>Git</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499776571591</start>
            <finish>1499776575220</finish>
            <agent>UNIT-1028</agent>
            <id>11</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>false</personal>
            <number>1</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
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
    </ChangeInfo>
  </changes>
  <personalChanges>
    <ChangeInfo>
      <mod>
        <myVcsDate>1501086163661</myVcsDate>
        <myVersion>26 07 2017 19:22</myVersion>
        <myDisplayVersion>26 07 2017 19:22</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>104</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1501086170376</start>
            <finish>1501086174052</finish>
            <agent>UNIT-1028</agent>
            <id>202</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>82</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1501086165071</start>
            <finish>1501086169471</finish>
            <agent>UNIT-1028</agent>
            <id>203</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>87</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>104</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus>0</myStatus>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1501085885364</myVcsDate>
        <myVersion>26 07 2017 19:18</myVersion>
        <myDisplayVersion>26 07 2017 19:18</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>103</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1501085892714</start>
            <finish>1501085896335</finish>
            <agent>UNIT-1028</agent>
            <id>200</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>81</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1501085886740</start>
            <finish>1501085891888</finish>
            <agent>UNIT-1028</agent>
            <id>201</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>86</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>5</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>103</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1501080358985</myVcsDate>
        <myVersion>26 07 2017 17:45</myVersion>
        <myDisplayVersion>26 07 2017 17:45</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>102</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1501080360413</start>
            <finish>1501080364540</finish>
            <agent>UNIT-1028</agent>
            <id>198</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>80</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1501080365389</start>
            <finish>1501080369430</finish>
            <agent>UNIT-1028</agent>
            <id>199</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>85</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>102</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1501080186838</myVcsDate>
        <myVersion>26 07 2017 17:43</myVersion>
        <myDisplayVersion>26 07 2017 17:43</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>101</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1501080188225</start>
            <finish>1501080192076</finish>
            <agent>UNIT-1028</agent>
            <id>196</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>79</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1501080192910</start>
            <finish>1501080196983</finish>
            <agent>UNIT-1028</agent>
            <id>197</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>84</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>101</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1501079704865</myVcsDate>
        <myVersion>26 07 2017 17:35</myVersion>
        <myDisplayVersion>26 07 2017 17:35</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>100</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1501079706346</start>
            <finish>1501079710307</finish>
            <agent>UNIT-1028</agent>
            <id>194</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>78</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1501079711169</start>
            <finish>1501079715161</finish>
            <agent>UNIT-1028</agent>
            <id>195</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>83</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>100</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1501079609492</myVcsDate>
        <myVersion>26 07 2017 17:33</myVersion>
        <myDisplayVersion>26 07 2017 17:33</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>99</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1501079610903</start>
            <finish>1501079614760</finish>
            <agent>UNIT-1028</agent>
            <id>192</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>77</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1501079615644</start>
            <finish>1501079619586</finish>
            <agent>UNIT-1028</agent>
            <id>193</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>82</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>99</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1501079064375</myVcsDate>
        <myVersion>26 07 2017 17:24</myVersion>
        <myDisplayVersion>26 07 2017 17:24</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>98</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1501079071211</start>
            <finish>1501079074974</finish>
            <agent>UNIT-1028</agent>
            <id>190</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>76</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1501079065844</start>
            <finish>1501079070331</finish>
            <agent>UNIT-1028</agent>
            <id>191</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>81</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>98</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1501078561984</myVcsDate>
        <myVersion>26 07 2017 17:16</myVersion>
        <myDisplayVersion>26 07 2017 17:16</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>97</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1501078564396</start>
            <finish>1501078568746</finish>
            <agent>UNIT-1028</agent>
            <id>188</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>75</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1501078569608</start>
            <finish>1501078573997</finish>
            <agent>UNIT-1028</agent>
            <id>189</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>80</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>97</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1501065195810</myVcsDate>
        <myVersion>26 07 2017 13:33</myVersion>
        <myDisplayVersion>26 07 2017 13:33</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>96</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1501065203143</start>
            <finish>1501065206632</finish>
            <agent>UNIT-1028</agent>
            <id>186</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>74</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1501065197201</start>
            <finish>1501065202259</finish>
            <agent>UNIT-1028</agent>
            <id>187</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>79</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>5</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>96</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500929928685</myVcsDate>
        <myVersion>24 07 2017 23:58</myVersion>
        <myDisplayVersion>24 07 2017 23:58</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>95</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500929930066</start>
            <finish>1500929933937</finish>
            <agent>UNIT-1028</agent>
            <id>156</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>58</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500929934800</start>
            <finish>1500929938952</finish>
            <agent>UNIT-1028</agent>
            <id>157</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>72</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>95</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500925789258</myVcsDate>
        <myVersion>24 07 2017 22:49</myVersion>
        <myDisplayVersion>24 07 2017 22:49</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>94</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500925796554</start>
            <finish>1500925800214</finish>
            <agent>UNIT-1028</agent>
            <id>154</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>57</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500925790735</start>
            <finish>1500925795709</finish>
            <agent>UNIT-1028</agent>
            <id>155</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>71</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>94</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500895055046</myVcsDate>
        <myVersion>24 07 2017 14:17</myVersion>
        <myDisplayVersion>24 07 2017 14:17</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>Some test commit</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>93</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500895061665</start>
            <finish>1500895065059</finish>
            <agent>UNIT-1028</agent>
            <id>150</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>55</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500895056462</start>
            <finish>1500895060800</finish>
            <agent>UNIT-1028</agent>
            <id>151</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>69</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>93</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500894919836</myVcsDate>
        <myVersion>24 07 2017 14:15</myVersion>
        <myDisplayVersion>24 07 2017 14:15</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>92</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500894921323</start>
            <finish>1500894925983</finish>
            <agent>UNIT-1028</agent>
            <id>146</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>53</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500894926841</start>
            <finish>1500894930855</finish>
            <agent>UNIT-1028</agent>
            <id>147</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>67</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>92</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500888126219</myVcsDate>
        <myVersion>24 07 2017 12:22</myVersion>
        <myDisplayVersion>24 07 2017 12:22</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>2</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>91</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
          <Build>
            <start>1500888127493</start>
            <finish>1500888134770</finish>
            <agent>UNIT-1028</agent>
            <id>145</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>15</number>
            <configuration reference="../../../../../../projects/Project[3]/configs/Configuration"/>
            <myDuration>7</myDuration>
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
        <myId>91</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500725516673</myVcsDate>
        <myVersion>22 07 2017 15:11</myVersion>
        <myDisplayVersion>22 07 2017 15:11</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>90</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
          <Build>
            <start>1500725517630</start>
            <finish>1500725524417</finish>
            <agent>UNIT-1028</agent>
            <id>143</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>13</number>
            <configuration reference="../../../../../../projects/Project[3]/configs/Configuration"/>
            <myDuration>6</myDuration>
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
        <myId>90</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500643320729</myVcsDate>
        <myVersion>21 07 2017 16:22</myVersion>
        <myDisplayVersion>21 07 2017 16:22</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>89</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
          <Build>
            <start>1500643322152</start>
            <finish>1500643328812</finish>
            <agent>UNIT-1028</agent>
            <id>142</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>12</number>
            <configuration reference="../../../../../../projects/Project[3]/configs/Configuration"/>
            <myDuration>6</myDuration>
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
        <myId>89</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500631526451</myVcsDate>
        <myVersion>21 07 2017 13:05</myVersion>
        <myDisplayVersion>21 07 2017 13:05</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>2</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>88</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500631533799</start>
            <finish>1500631537280</finish>
            <agent>UNIT-1028</agent>
            <id>138</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>51</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500631527902</start>
            <finish>1500631532909</finish>
            <agent>UNIT-1028</agent>
            <id>139</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>65</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>5</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>88</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500630303097</myVcsDate>
        <myVersion>21 07 2017 12:45</myVersion>
        <myDisplayVersion>21 07 2017 12:45</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>87</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
          <Build>
            <start>1500630307883</start>
            <finish>1500630313453</finish>
            <agent>UNIT-1028</agent>
            <id>137</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>11</number>
            <configuration reference="../../../../../../projects/Project[3]/configs/Configuration"/>
            <myDuration>5</myDuration>
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
        <myId>87</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500628798483</myVcsDate>
        <myVersion>21 07 2017 12:19</myVersion>
        <myDisplayVersion>21 07 2017 12:19</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>86</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
          <Build>
            <start>1500628799460</start>
            <finish>1500628804929</finish>
            <agent>UNIT-1028</agent>
            <id>135</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>9</number>
            <configuration reference="../../../../../../projects/Project[3]/configs/Configuration"/>
            <myDuration>5</myDuration>
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
        <myId>86</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500628200792</myVcsDate>
        <myVersion>21 07 2017 12:10</myVersion>
        <myDisplayVersion>21 07 2017 12:10</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>2</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>85</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500628208010</start>
            <finish>1500628211516</finish>
            <agent>UNIT-1028</agent>
            <id>131</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>49</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500628202227</start>
            <finish>1500628207097</finish>
            <agent>UNIT-1028</agent>
            <id>132</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>63</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>85</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500627875816</myVcsDate>
        <myVersion>21 07 2017 12:04</myVersion>
        <myDisplayVersion>21 07 2017 12:04</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>2</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>84</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500627882529</start>
            <finish>1500627885910</finish>
            <agent>UNIT-1028</agent>
            <id>129</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>48</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500627877338</start>
            <finish>1500627881713</finish>
            <agent>UNIT-1028</agent>
            <id>130</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>62</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>84</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500627747017</myVcsDate>
        <myVersion>21 07 2017 12:02</myVersion>
        <myDisplayVersion>21 07 2017 12:02</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>2</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>83</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500627753701</start>
            <finish>1500627757168</finish>
            <agent>UNIT-1028</agent>
            <id>127</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>47</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500627748366</start>
            <finish>1500627752854</finish>
            <agent>UNIT-1028</agent>
            <id>128</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>61</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>83</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500627665425</myVcsDate>
        <myVersion>21 07 2017 12:01</myVersion>
        <myDisplayVersion>21 07 2017 12:01</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>2</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>82</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500627671053</start>
            <finish>1500627674481</finish>
            <agent>UNIT-1028</agent>
            <id>125</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>46</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500627666299</start>
            <finish>1500627670192</finish>
            <agent>UNIT-1028</agent>
            <id>126</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>60</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>82</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500627599480</myVcsDate>
        <myVersion>21 07 2017 11:59</myVersion>
        <myDisplayVersion>21 07 2017 11:59</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>81</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500627601045</start>
            <finish>1500627604387</finish>
            <agent>UNIT-1028</agent>
            <id>123</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>45</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500627605957</start>
            <finish>1500627609873</finish>
            <agent>UNIT-1028</agent>
            <id>124</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>59</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>81</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500627553518</myVcsDate>
        <myVersion>21 07 2017 11:59</myVersion>
        <myDisplayVersion>21 07 2017 11:59</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>80</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500627564384</start>
            <finish>1500627567665</finish>
            <agent>UNIT-1028</agent>
            <id>121</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>44</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500627559543</start>
            <finish>1500627563571</finish>
            <agent>UNIT-1028</agent>
            <id>122</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>58</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>80</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500627458128</myVcsDate>
        <myVersion>21 07 2017 11:57</myVersion>
        <myDisplayVersion>21 07 2017 11:57</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>79</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500627463927</start>
            <finish>1500627466870</finish>
            <agent>UNIT-1028</agent>
            <id>117</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>42</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>2</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500627459102</start>
            <finish>1500627463060</finish>
            <agent>UNIT-1028</agent>
            <id>118</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>56</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>79</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500627135245</myVcsDate>
        <myVersion>21 07 2017 11:52</myVersion>
        <myDisplayVersion>21 07 2017 11:52</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>78</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500627141411</start>
            <finish>1500627144336</finish>
            <agent>UNIT-1028</agent>
            <id>115</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>41</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>2</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500627136664</start>
            <finish>1500627140505</finish>
            <agent>UNIT-1028</agent>
            <id>116</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>55</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>78</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500627070800</myVcsDate>
        <myVersion>21 07 2017 11:51</myVersion>
        <myDisplayVersion>21 07 2017 11:51</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>77</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500627072197</start>
            <finish>1500627075397</finish>
            <agent>UNIT-1028</agent>
            <id>113</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>40</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500627076236</start>
            <finish>1500627079576</finish>
            <agent>UNIT-1028</agent>
            <id>114</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>54</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>77</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500625926215</myVcsDate>
        <myVersion>21 07 2017 11:32</myVersion>
        <myDisplayVersion>21 07 2017 11:32</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>76</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500625934246</start>
            <finish>1500625937681</finish>
            <agent>UNIT-1028</agent>
            <id>111</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>39</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500625927593</start>
            <finish>1500625933381</finish>
            <agent>UNIT-1028</agent>
            <id>112</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>53</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>5</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>76</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500625630991</myVcsDate>
        <myVersion>21 07 2017 11:27</myVersion>
        <myDisplayVersion>21 07 2017 11:27</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>75</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500625632368</start>
            <finish>1500625636251</finish>
            <agent>UNIT-1028</agent>
            <id>109</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Compilation error: Compiler (new)</myText>
              <myStatus>3</myStatus>
            </statusDescriptor>
            <personal>true</personal>
            <number>38</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500625637096</start>
            <finish>1500625640855</finish>
            <agent>UNIT-1028</agent>
            <id>110</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Compilation error: Compiler (new)</myText>
              <myStatus reference="../../../../entry/Build/statusDescriptor/myStatus"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>52</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>75</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>FAILED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500625547962</myVcsDate>
        <myVersion>21 07 2017 11:25</myVersion>
        <myDisplayVersion>21 07 2017 11:25</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>74</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500625554366</start>
            <finish>1500625557988</finish>
            <agent>UNIT-1028</agent>
            <id>107</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Compilation error: Compiler (new)</myText>
              <myStatus reference="../../../../../../ChangeInfo[30]/myTypeToInstanceMap/entry/Build/statusDescriptor/myStatus"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>37</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500625549389</start>
            <finish>1500625553500</finish>
            <agent>UNIT-1028</agent>
            <id>108</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Compilation error: Compiler (new)</myText>
              <myStatus reference="../../../../../../ChangeInfo[30]/myTypeToInstanceMap/entry/Build/statusDescriptor/myStatus"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>51</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>74</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>FAILED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500624536512</myVcsDate>
        <myVersion>21 07 2017 11:08</myVersion>
        <myDisplayVersion>21 07 2017 11:08</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>73</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500624544027</start>
            <finish>1500624547880</finish>
            <agent>UNIT-1028</agent>
            <id>105</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Compilation error: Compiler (new)</myText>
              <myStatus reference="../../../../../../ChangeInfo[30]/myTypeToInstanceMap/entry/Build/statusDescriptor/myStatus"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>36</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500624537893</start>
            <finish>1500624542600</finish>
            <agent>UNIT-1028</agent>
            <id>106</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Compilation error: Compiler (new)</myText>
              <myStatus reference="../../../../../../ChangeInfo[30]/myTypeToInstanceMap/entry/Build/statusDescriptor/myStatus"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>50</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>73</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>FAILED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500622295816</myVcsDate>
        <myVersion>21 07 2017 10:31</myVersion>
        <myDisplayVersion>21 07 2017 10:31</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>72</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
          <Build>
            <start>1500622296773</start>
            <finish>1500622303298</finish>
            <agent>UNIT-1028</agent>
            <id>103</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>7</number>
            <configuration reference="../../../../../../projects/Project[3]/configs/Configuration"/>
            <myDuration>6</myDuration>
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
        <myId>72</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500560705485</myVcsDate>
        <myVersion>20 07 2017 17:25</myVersion>
        <myDisplayVersion>20 07 2017 17:25</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>71</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500560712031</start>
            <finish>1500560716339</finish>
            <agent>UNIT-1028</agent>
            <id>101</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>35</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500560706835</start>
            <finish>1500560711195</finish>
            <agent>UNIT-1028</agent>
            <id>102</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>49</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>71</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500560640796</myVcsDate>
        <myVersion>20 07 2017 17:24</myVersion>
        <myDisplayVersion>20 07 2017 17:24</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>70</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500560642461</start>
            <finish>1500560646324</finish>
            <agent>UNIT-1028</agent>
            <id>99</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>34</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500560647166</start>
            <finish>1500560651330</finish>
            <agent>UNIT-1028</agent>
            <id>100</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>48</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>70</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500554932102</myVcsDate>
        <myVersion>20 07 2017 15:48</myVersion>
        <myDisplayVersion>20 07 2017 15:48</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>undefined</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>69</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500554933519</start>
            <finish>1500554938025</finish>
            <agent>UNIT-1028</agent>
            <id>97</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>33</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500554938891</start>
            <finish>1500554943804</finish>
            <agent>UNIT-1028</agent>
            <id>98</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>47</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>69</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500554814764</myVcsDate>
        <myVersion>20 07 2017 15:46</myVersion>
        <myDisplayVersion>20 07 2017 15:46</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>undefined</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>68</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500554815596</start>
            <finish>1500554821397</finish>
            <agent>UNIT-1028</agent>
            <id>95</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>32</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>5</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500554822406</start>
            <finish>1500554826812</finish>
            <agent>UNIT-1028</agent>
            <id>96</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>46</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>68</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500554756499</myVcsDate>
        <myVersion>20 07 2017 15:45</myVersion>
        <myDisplayVersion>20 07 2017 15:45</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>undefined</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>67</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
          <Build>
            <start>1500554761511</start>
            <finish>1500554766854</finish>
            <agent>UNIT-1028</agent>
            <id>94</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>6</number>
            <configuration reference="../../../../../../projects/Project[3]/configs/Configuration"/>
            <myDuration>5</myDuration>
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
        <myId>67</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500482087886</myVcsDate>
        <myVersion>19 07 2017 19:34</myVersion>
        <myDisplayVersion>19 07 2017 19:34</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>undefined</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>5</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>66</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
          <Build>
            <start>1500482088779</start>
            <finish>1500482094051</finish>
            <agent>UNIT-1028</agent>
            <id>92</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>4</number>
            <configuration reference="../../../../../../projects/Project[3]/configs/Configuration"/>
            <myDuration>5</myDuration>
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
        <myId>66</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500480274785</myVcsDate>
        <myVersion>19 07 2017 19:04</myVersion>
        <myDisplayVersion>19 07 2017 19:04</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>undefined</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>5</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>65</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
          <Build>
            <start>1500480275731</start>
            <finish>1500480282267</finish>
            <agent>UNIT-1028</agent>
            <id>91</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>3</number>
            <configuration reference="../../../../../../projects/Project[3]/configs/Configuration"/>
            <myDuration>6</myDuration>
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
        <myId>65</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500480161262</myVcsDate>
        <myVersion>19 07 2017 19:02</myVersion>
        <myDisplayVersion>19 07 2017 19:02</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>undefined</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>64</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500480162700</start>
            <finish>1500480167142</finish>
            <agent>UNIT-1028</agent>
            <id>89</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>31</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500480167977</start>
            <finish>1500480172116</finish>
            <agent>UNIT-1028</agent>
            <id>90</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>45</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>64</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500457909365</myVcsDate>
        <myVersion>19 07 2017 12:51</myVersion>
        <myDisplayVersion>19 07 2017 12:51</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>5</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>63</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
          <Build>
            <start>1500457910320</start>
            <finish>1500457915461</finish>
            <agent>UNIT-1028</agent>
            <id>88</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>2</number>
            <configuration reference="../../../../../../projects/Project[3]/configs/Configuration"/>
            <myDuration>5</myDuration>
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
        <myId>63</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
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
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500383267856</myVcsDate>
        <myVersion>18 07 2017 16:07</myVersion>
        <myDisplayVersion>18 07 2017 16:07</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>59</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500383269318</start>
            <finish>1500383272875</finish>
            <agent>UNIT-1028</agent>
            <id>85</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>30</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500383273818</start>
            <finish>1500383277902</finish>
            <agent>UNIT-1028</agent>
            <id>86</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>44</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>59</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500382774172</myVcsDate>
        <myVersion>18 07 2017 15:59</myVersion>
        <myDisplayVersion>18 07 2017 15:59</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>58</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500382780099</start>
            <finish>1500382783556</finish>
            <agent>UNIT-1028</agent>
            <id>83</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>29</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500382775064</start>
            <finish>1500382779213</finish>
            <agent>UNIT-1028</agent>
            <id>84</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>43</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>58</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500382525876</myVcsDate>
        <myVersion>18 07 2017 15:55</myVersion>
        <myDisplayVersion>18 07 2017 15:55</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>57</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500382531921</start>
            <finish>1500382535511</finish>
            <agent>UNIT-1028</agent>
            <id>81</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>28</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500382536703</start>
            <finish>1500382540772</finish>
            <agent>UNIT-1028</agent>
            <id>82</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>42</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>57</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500380304715</myVcsDate>
        <myVersion>18 07 2017 15:18</myVersion>
        <myDisplayVersion>18 07 2017 15:18</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>56</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500380317719</start>
            <finish>1500380321425</finish>
            <agent>UNIT-1028</agent>
            <id>79</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>27</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500380309887</start>
            <finish>1500380316852</finish>
            <agent>UNIT-1028</agent>
            <id>80</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>41</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>6</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>56</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500303241816</myVcsDate>
        <myVersion>17 07 2017 17:54</myVersion>
        <myDisplayVersion>17 07 2017 17:54</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>55</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
          <Build>
            <start>1500388337903</start>
            <finish>1500388337903</finish>
            <agent>N/A</agent>
            <id>78</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Canceled</myText>
              <myStatus reference="../../../../../../ChangeInfo/myPersonalDesc/myStatus"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>N/A</number>
            <configuration reference="../../../../../../projects/Project[3]/configs/Configuration"/>
            <myCanceledInfo>
              <userId>1</userId>
              <comment></comment>
              <myCreatedAt>1501051882937</myCreatedAt>
            </myCanceledInfo>
            <myDuration>0</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
          <null/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[3]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>55</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CANCELED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500303177774</myVcsDate>
        <myVersion>17 07 2017 17:52</myVersion>
        <myDisplayVersion>17 07 2017 17:52</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>54</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500303182220</start>
            <finish>1500303188405</finish>
            <agent>UNIT-1028</agent>
            <id>77</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>26</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>6</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>54</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500297106139</myVcsDate>
        <myVersion>17 07 2017 16:11</myVersion>
        <myDisplayVersion>17 07 2017 16:11</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>53</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500297112817</start>
            <finish>1500297116440</finish>
            <agent>UNIT-1028</agent>
            <id>75</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>25</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500297107575</start>
            <finish>1500297111910</finish>
            <agent>UNIT-1028</agent>
            <id>76</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>40</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>53</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500295808434</myVcsDate>
        <myVersion>17 07 2017 15:50</myVersion>
        <myDisplayVersion>17 07 2017 15:50</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>52</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500295809851</start>
            <finish>1500295814856</finish>
            <agent>UNIT-1028</agent>
            <id>73</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>24</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>5</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500295815729</start>
            <finish>1500295821203</finish>
            <agent>UNIT-1028</agent>
            <id>74</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>39</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>5</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>52</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500295434761</myVcsDate>
        <myVersion>17 07 2017 15:43</myVersion>
        <myDisplayVersion>17 07 2017 15:43</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>51</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500295436634</start>
            <finish>1500295440634</finish>
            <agent>UNIT-1028</agent>
            <id>71</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>23</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500295441480</start>
            <finish>1500295445821</finish>
            <agent>UNIT-1028</agent>
            <id>72</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>38</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>51</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500295101885</myVcsDate>
        <myVersion>17 07 2017 15:38</myVersion>
        <myDisplayVersion>17 07 2017 15:38</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>50</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500295104133</start>
            <finish>1500295108239</finish>
            <agent>UNIT-1028</agent>
            <id>69</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>22</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500295109174</start>
            <finish>1500295113605</finish>
            <agent>UNIT-1028</agent>
            <id>70</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>37</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>50</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500280120465</myVcsDate>
        <myVersion>17 07 2017 11:28</myVersion>
        <myDisplayVersion>17 07 2017 11:28</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>49</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500280121868</start>
            <finish>1500280126568</finish>
            <agent>UNIT-1028</agent>
            <id>68</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>36</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>49</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500277152254</myVcsDate>
        <myVersion>17 07 2017 10:39</myVersion>
        <myDisplayVersion>17 07 2017 10:39</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>48</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500277153581</start>
            <finish>1500277157756</finish>
            <agent>UNIT-1028</agent>
            <id>66</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>21</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500277158606</start>
            <finish>1500277163065</finish>
            <agent>UNIT-1028</agent>
            <id>67</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>35</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>48</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500277059871</myVcsDate>
        <myVersion>17 07 2017 10:37</myVersion>
        <myDisplayVersion>17 07 2017 10:37</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>47</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500277061350</start>
            <finish>1500277065635</finish>
            <agent>UNIT-1028</agent>
            <id>64</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>20</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500277066538</start>
            <finish>1500277071325</finish>
            <agent>UNIT-1028</agent>
            <id>65</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>34</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>47</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500275150103</myVcsDate>
        <myVersion>17 07 2017 10:05</myVersion>
        <myDisplayVersion>17 07 2017 10:05</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>46</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500275157809</start>
            <finish>1500275162179</finish>
            <agent>UNIT-1028</agent>
            <id>62</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>19</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500275151606</start>
            <finish>1500275156920</finish>
            <agent>UNIT-1028</agent>
            <id>63</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>33</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>5</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>46</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500221885763</myVcsDate>
        <myVersion>16 07 2017 19:18</myVersion>
        <myDisplayVersion>16 07 2017 19:18</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription></myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>45</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500221892981</start>
            <finish>1500221897009</finish>
            <agent>UNIT-1028</agent>
            <id>60</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>18</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500221887145</start>
            <finish>1500221892138</finish>
            <agent>UNIT-1028</agent>
            <id>61</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>32</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>45</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500213315448</myVcsDate>
        <myVersion>16 07 2017 16:55</myVersion>
        <myDisplayVersion>16 07 2017 16:55</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>44</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500213322432</start>
            <finish>1500213326428</finish>
            <agent>UNIT-1028</agent>
            <id>58</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>17</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500213316879</start>
            <finish>1500213321545</finish>
            <agent>UNIT-1028</agent>
            <id>59</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>31</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>44</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500212835465</myVcsDate>
        <myVersion>16 07 2017 16:47</myVersion>
        <myDisplayVersion>16 07 2017 16:47</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>43</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500212836850</start>
            <finish>1500212841272</finish>
            <agent>UNIT-1028</agent>
            <id>57</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>30</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>43</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500211240764</myVcsDate>
        <myVersion>16 07 2017 16:20</myVersion>
        <myDisplayVersion>16 07 2017 16:20</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>42</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500211242212</start>
            <finish>1500211247171</finish>
            <agent>UNIT-1028</agent>
            <id>55</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>16</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500211248033</start>
            <finish>1500211252446</finish>
            <agent>UNIT-1028</agent>
            <id>56</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>29</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>42</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500210967307</myVcsDate>
        <myVersion>16 07 2017 16:16</myVersion>
        <myDisplayVersion>16 07 2017 16:16</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>41</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500210970436</start>
            <finish>1500210974287</finish>
            <agent>UNIT-1028</agent>
            <id>54</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>15</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>41</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500210959271</myVcsDate>
        <myVersion>16 07 2017 16:15</myVersion>
        <myDisplayVersion>16 07 2017 16:15</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>40</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500210960152</start>
            <finish>1500210963973</finish>
            <agent>UNIT-1028</agent>
            <id>53</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>14</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500210964872</start>
            <finish>1500210969590</finish>
            <agent>UNIT-1028</agent>
            <id>52</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>28</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>40</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500210951356</myVcsDate>
        <myVersion>16 07 2017 16:15</myVersion>
        <myDisplayVersion>16 07 2017 16:15</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>39</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500210952837</start>
            <finish>1500210957373</finish>
            <agent>UNIT-1028</agent>
            <id>51</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>27</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>39</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500209949679</myVcsDate>
        <myVersion>16 07 2017 15:59</myVersion>
        <myDisplayVersion>16 07 2017 15:59</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>38</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500209951038</start>
            <finish>1500209955552</finish>
            <agent>UNIT-1028</agent>
            <id>50</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>26</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>38</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500209912762</myVcsDate>
        <myVersion>16 07 2017 15:58</myVersion>
        <myDisplayVersion>16 07 2017 15:58</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>37</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500209914136</start>
            <finish>1500209918483</finish>
            <agent>UNIT-1028</agent>
            <id>49</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>25</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>37</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500208320556</myVcsDate>
        <myVersion>16 07 2017 15:32</myVersion>
        <myDisplayVersion>16 07 2017 15:32</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>36</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500208327796</start>
            <finish>1500208331726</finish>
            <agent>UNIT-1028</agent>
            <id>47</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>13</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500208322005</start>
            <finish>1500208326949</finish>
            <agent>UNIT-1028</agent>
            <id>48</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>24</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>36</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500208300634</myVcsDate>
        <myVersion>16 07 2017 15:31</myVersion>
        <myDisplayVersion>16 07 2017 15:31</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>2</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>35</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500208301989</start>
            <finish>1500208306025</finish>
            <agent>UNIT-1028</agent>
            <id>46</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>12</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>35</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500208285863</myVcsDate>
        <myVersion>16 07 2017 15:31</myVersion>
        <myDisplayVersion>16 07 2017 15:31</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>2</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>34</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500208287196</start>
            <finish>1500208291183</finish>
            <agent>UNIT-1028</agent>
            <id>45</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>11</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>34</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500207989826</myVcsDate>
        <myVersion>16 07 2017 15:26</myVersion>
        <myDisplayVersion>16 07 2017 15:26</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>2</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>33</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500207991258</start>
            <finish>1500207995776</finish>
            <agent>UNIT-1028</agent>
            <id>44</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>23</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>33</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500207646702</myVcsDate>
        <myVersion>16 07 2017 15:20</myVersion>
        <myDisplayVersion>16 07 2017 15:20</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>32</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500207653561</start>
            <finish>1500207657907</finish>
            <agent>UNIT-1028</agent>
            <id>42</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>10</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500207648122</start>
            <finish>1500207652674</finish>
            <agent>UNIT-1028</agent>
            <id>43</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>22</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>32</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500207046025</myVcsDate>
        <myVersion>16 07 2017 15:10</myVersion>
        <myDisplayVersion>16 07 2017 15:10</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>31</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1500207052652</start>
            <finish>1500207056385</finish>
            <agent>UNIT-1028</agent>
            <id>40</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>9</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500207047452</start>
            <finish>1500207051812</finish>
            <agent>UNIT-1028</agent>
            <id>41</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>21</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry[2]/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>31</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500205702202</myVcsDate>
        <myVersion>16 07 2017 14:48</myVersion>
        <myDisplayVersion>16 07 2017 14:48</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>30</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500205708386</start>
            <finish>1500205713091</finish>
            <agent>UNIT-1028</agent>
            <id>39</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>20</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>30</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500205702183</myVcsDate>
        <myVersion>16 07 2017 14:48</myVersion>
        <myDisplayVersion>16 07 2017 14:48</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>29</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500205703047</start>
            <finish>1500205707536</finish>
            <agent>UNIT-1028</agent>
            <id>38</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>19</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>29</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500205641130</myVcsDate>
        <myVersion>16 07 2017 14:47</myVersion>
        <myDisplayVersion>16 07 2017 14:47</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>28</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500205642545</start>
            <finish>1500205647134</finish>
            <agent>UNIT-1028</agent>
            <id>37</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>18</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>28</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1500205358802</myVcsDate>
        <myVersion>16 07 2017 14:42</myVersion>
        <myDisplayVersion>16 07 2017 14:42</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>27</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1500205360247</start>
            <finish>1500205365535</finish>
            <agent>UNIT-1028</agent>
            <id>36</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>17</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>5</myDuration>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>27</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499955266543</myVcsDate>
        <myVersion>13 07 2017 17:14</myVersion>
        <myDisplayVersion>13 07 2017 17:14</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>4</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>26</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1499955267983</start>
            <finish>1499955272395</finish>
            <agent>UNIT-1028</agent>
            <id>35</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>8</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>26</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499954383482</myVcsDate>
        <myVersion>13 07 2017 16:59</myVersion>
        <myDisplayVersion>13 07 2017 16:59</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>2</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>25</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build>
            <start>1499954385322</start>
            <finish>1499954387750</finish>
            <agent>UNIT-1028</agent>
            <id>34</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>11</number>
            <configuration reference="../../../../../../projects/Project[4]/configs/Configuration"/>
            <myDuration>2</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>25</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499950641771</myVcsDate>
        <myVersion>13 07 2017 15:57</myVersion>
        <myDisplayVersion>13 07 2017 15:57</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>3</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>24</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1499950643533</start>
            <finish>1499950648072</finish>
            <agent>UNIT-1028</agent>
            <id>33</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>7</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>24</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499944787784</myVcsDate>
        <myVersion>13 07 2017 14:19</myVersion>
        <myDisplayVersion>13 07 2017 14:19</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>23</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1499944789170</start>
            <finish>1499944793506</finish>
            <agent>UNIT-1028</agent>
            <id>31</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>5</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>23</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499862583775</myVcsDate>
        <myVersion>12 07 2017 15:29</myVersion>
        <myDisplayVersion>12 07 2017 15:29</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>22</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499862585833</start>
            <finish>1499862590065</finish>
            <agent>UNIT-1028</agent>
            <id>30</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>16</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>22</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499862568519</myVcsDate>
        <myVersion>12 07 2017 15:29</myVersion>
        <myDisplayVersion>12 07 2017 15:29</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>21</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1499862570494</start>
            <finish>1499862575595</finish>
            <agent>UNIT-1028</agent>
            <id>29</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>4</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>5</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>21</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499784984174</myVcsDate>
        <myVersion>11 07 2017 17:56</myVersion>
        <myDisplayVersion>11 07 2017 17:56</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>20</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1499784985571</start>
            <finish>1499784989547</finish>
            <agent>UNIT-1028</agent>
            <id>28</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>3</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>20</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499784848276</myVcsDate>
        <myVersion>11 07 2017 17:54</myVersion>
        <myDisplayVersion>11 07 2017 17:54</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>19</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1499784849686</start>
            <finish>1499784853085</finish>
            <agent>UNIT-1028</agent>
            <id>27</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Exit code 1 (new)</myText>
              <myStatus reference="../../../../../../ChangeInfo[30]/myTypeToInstanceMap/entry/Build/statusDescriptor/myStatus"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>2</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>19</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>FAILED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499784733014</myVcsDate>
        <myVersion>11 07 2017 17:52</myVersion>
        <myDisplayVersion>11 07 2017 17:52</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>18</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build>
            <start>1499784734429</start>
            <finish>1499784738088</finish>
            <agent>UNIT-1028</agent>
            <id>26</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Exit code 1 (new)</myText>
              <myStatus reference="../../../../../../ChangeInfo[30]/myTypeToInstanceMap/entry/Build/statusDescriptor/myStatus"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>1</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <null/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>18</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>FAILED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499784701988</myVcsDate>
        <myVersion>11 07 2017 17:51</myVersion>
        <myDisplayVersion>11 07 2017 17:51</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>17</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499784703355</start>
            <finish>1499784708041</finish>
            <agent>UNIT-1028</agent>
            <id>25</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>15</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>17</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499784150595</myVcsDate>
        <myVersion>11 07 2017 17:42</myVersion>
        <myDisplayVersion>11 07 2017 17:42</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>16</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499784151952</start>
            <finish>1499784156383</finish>
            <agent>UNIT-1028</agent>
            <id>24</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>14</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>16</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499784137582</myVcsDate>
        <myVersion>11 07 2017 17:42</myVersion>
        <myDisplayVersion>11 07 2017 17:42</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>15</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499784138979</start>
            <finish>1499784142963</finish>
            <agent>UNIT-1028</agent>
            <id>23</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Compilation error: Compiler (new)</myText>
              <myStatus reference="../../../../../../ChangeInfo[30]/myTypeToInstanceMap/entry/Build/statusDescriptor/myStatus"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>13</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>15</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>FAILED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499784098272</myVcsDate>
        <myVersion>11 07 2017 17:41</myVersion>
        <myDisplayVersion>11 07 2017 17:41</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>14</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499784099675</start>
            <finish>1499784103711</finish>
            <agent>UNIT-1028</agent>
            <id>22</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Compilation error: Compiler (new)</myText>
              <myStatus reference="../../../../../../ChangeInfo[30]/myTypeToInstanceMap/entry/Build/statusDescriptor/myStatus"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>12</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>14</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>FAILED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499783517710</myVcsDate>
        <myVersion>11 07 2017 17:31</myVersion>
        <myDisplayVersion>11 07 2017 17:31</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>13</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499783519132</start>
            <finish>1499783523007</finish>
            <agent>UNIT-1028</agent>
            <id>21</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Compilation error: Compiler (new)</myText>
              <myStatus reference="../../../../../../ChangeInfo[30]/myTypeToInstanceMap/entry/Build/statusDescriptor/myStatus"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>11</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>13</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>FAILED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499783494668</myVcsDate>
        <myVersion>11 07 2017 17:31</myVersion>
        <myDisplayVersion>11 07 2017 17:31</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>12</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499783496112</start>
            <finish>1499783500005</finish>
            <agent>UNIT-1028</agent>
            <id>20</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>10</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>12</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499782656833</myVcsDate>
        <myVersion>11 07 2017 17:17</myVersion>
        <myDisplayVersion>11 07 2017 17:17</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>11</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499782658224</start>
            <finish>1499782661974</finish>
            <agent>UNIT-1028</agent>
            <id>19</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Compilation error: Compiler (new)</myText>
              <myStatus reference="../../../../../../ChangeInfo[30]/myTypeToInstanceMap/entry/Build/statusDescriptor/myStatus"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>9</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <null/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>11</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>FAILED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499782617188</myVcsDate>
        <myVersion>11 07 2017 17:16</myVersion>
        <myDisplayVersion>11 07 2017 17:16</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>10</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499782618543</start>
            <finish>1499782622879</finish>
            <agent>UNIT-1028</agent>
            <id>18</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>8</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>10</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499782478195</myVcsDate>
        <myVersion>11 07 2017 17:14</myVersion>
        <myDisplayVersion>11 07 2017 17:14</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>9</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499782479548</start>
            <finish>1499782483391</finish>
            <agent>UNIT-1028</agent>
            <id>17</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>7</number>
            <configuration reference="../../../../../../projects/Project[2]/configs/Configuration[2]"/>
            <myDuration>3</myDuration>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>9</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499782429974</myVcsDate>
        <myVersion>11 07 2017 17:13</myVersion>
        <myDisplayVersion>11 07 2017 17:13</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>8</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499782431371</start>
            <finish>1499782435663</finish>
            <agent>UNIT-1028</agent>
            <id>16</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>6</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>8</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499781670771</myVcsDate>
        <myVersion>11 07 2017 17:01</myVersion>
        <myDisplayVersion>11 07 2017 17:01</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>&quot;smt&quot;</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>7</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[2]/configs/Configuration[2]"/>
          <Build>
            <start>1499781672172</start>
            <finish>1499781676474</finish>
            <agent>UNIT-1028</agent>
            <id>15</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>5</number>
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
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>7</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499773372743</myVcsDate>
        <myVersion>11 07 2017 14:42</myVersion>
        <myDisplayVersion>11 07 2017 14:42</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>6</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build>
            <start>1499773376641</start>
            <finish>1499773378557</finish>
            <agent>UNIT-1028</agent>
            <id>10</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>10</number>
            <configuration reference="../../../../../../projects/Project[4]/configs/Configuration"/>
            <myDuration>1</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>6</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499773303929</myVcsDate>
        <myVersion>11 07 2017 14:41</myVersion>
        <myDisplayVersion>11 07 2017 14:41</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>5</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build>
            <start>1499773305313</start>
            <finish>1499773307289</finish>
            <agent>UNIT-1028</agent>
            <id>9</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>9</number>
            <configuration reference="../../../../../../projects/Project[4]/configs/Configuration"/>
            <myDuration>1</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>5</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499773222313</myVcsDate>
        <myVersion>11 07 2017 14:40</myVersion>
        <myDisplayVersion>11 07 2017 14:40</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>4</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build>
            <start>1499773223934</start>
            <finish>1499773226024</finish>
            <agent>UNIT-1028</agent>
            <id>8</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>8</number>
            <configuration reference="../../../../../../projects/Project[4]/configs/Configuration"/>
            <myDuration>2</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>4</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499769401411</myVcsDate>
        <myVersion>11 07 2017 13:36</myVersion>
        <myDisplayVersion>11 07 2017 13:36</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>remote run message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>3</id>
        <personal>true</personal>
        <myVersionControlName>Pre-Tested Commit</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build>
            <start>1499769403053</start>
            <finish>1499769405769</finish>
            <agent>UNIT-1028</agent>
            <id>7</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>7</number>
            <configuration reference="../../../../../../projects/Project[4]/configs/Configuration"/>
            <myDuration>2</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>3</myId>
        <myUserId>1</myUserId>
        <myCommitType>1</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499167117054</myVcsDate>
        <myVersion>04 07 2017 14:18</myVersion>
        <myDisplayVersion>04 07 2017 14:18</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>2</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build>
            <start>1499167118334</start>
            <finish>1499167121098</finish>
            <agent>UNIT-1028</agent>
            <id>6</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>6</number>
            <configuration reference="../../../../../../projects/Project[4]/configs/Configuration"/>
            <myDuration>2</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>2</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
    <ChangeInfo>
      <mod>
        <myVcsDate>1499159691257</myVcsDate>
        <myVersion>04 07 2017 12:14</myVersion>
        <myDisplayVersion>04 07 2017 12:14</myDisplayVersion>
        <myUser>rugpanov</myUser>
        <myDescription>message</myDescription>
        <myChanges class="java.util.Collections$EmptyList" reference="../../../../changes/ChangeInfo/mod/myChanges"/>
        <myChangesCount>1</myChangesCount>
        <myCanBeIgnored>true</myCanBeIgnored>
        <id>1</id>
        <personal>true</personal>
        <myVersionControlName>Remote Run</myVersionControlName>
      </mod>
      <myTypeToInstanceMap class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build>
            <start>1499159692685</start>
            <finish>1499159697605</finish>
            <agent>UNIT-1028</agent>
            <id>5</id>
            <estimationTimeLeft>-1</estimationTimeLeft>
            <statusDescriptor>
              <myText>Success</myText>
              <myStatus reference="../../../../../../../projects/Project/status"/>
            </statusDescriptor>
            <personal>true</personal>
            <number>5</number>
            <configuration reference="../../../../../../projects/Project[4]/configs/Configuration"/>
            <myDuration>4</myDuration>
          </Build>
        </entry>
      </myTypeToInstanceMap>
      <fixed class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <Build reference="../../../myTypeToInstanceMap/entry/Build"/>
        </entry>
      </fixed>
      <current class="linked-hash-map">
        <entry>
          <Configuration reference="../../../../../projects/Project[4]/configs/Configuration"/>
          <null/>
        </entry>
      </current>
      <users class="java.util.Collections$SingletonList">
        <element class="long">1</element>
      </users>
      <myPersonalDesc>
        <myId>1</myId>
        <myUserId>1</myUserId>
        <myCommitType>0</myCommitType>
        <myStatus reference="../../../ChangeInfo/myPersonalDesc/myStatus"/>
        <myCommitDecision>DO_NOT_COMMIT</myCommitDecision>
      </myPersonalDesc>
      <myStatus>CHECKED</myStatus>
    </ChangeInfo>
  </personalChanges>
  <myWatchedConfigurationIds>
    <string>bt3</string>
    <string>bt2</string>
  </myWatchedConfigurationIds>
  <watchedStatus reference="../projects/Project/status"/>
  <myVisibleProjects class="set">
    <string>_Root</string>
    <string>project2</string>
  </myVisibleProjects>
  <myProjectStatuses>
    <entry>
      <string>_Root</string>
      <jetbrains.buildServer.messages.Status reference="../../../projects/Project/status"/>
    </entry>
    <entry>
      <string>project2</string>
      <jetbrains.buildServer.messages.Status reference="../../../projects/Project/status"/>
    </entry>
  </myProjectStatuses>
  <myTestsWithInvestigation/>
  <myResponsibleExists>true</myResponsibleExists>
  <myChangesStatus reference="../projects/Project/status"/>
  <myFilteredOutProjectsCount>0</myFilteredOutProjectsCount>
  <myFilteredOutChangesCount>0</myFilteredOutChangesCount>
  <mySummaryCounter>637</mySummaryCounter>
</Summary>`;

const changePersonalObjXml : string = `<ChangeInfo>
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

const changeNonPersonalObjXml : string = `<ChangeInfo>
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
