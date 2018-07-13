import "reflect-metadata";
import {XmlParser} from "../../../src/bll/utils/xmlparser";
import {Project} from "../../../src/bll/entities/project";
import * as assert from "assert";
import {BuildConfig} from "../../../src/bll/entities/buildconfig";

const rmock = require("mock-require");
rmock("vscode", {});

suite("XmlParser", () => {
    const xmlParser: XmlParser = new XmlParser();
    test("should verify parseProjects when data is empty", function (done) {
        xmlParser.parseProjectsWithRelatedBuilds(undefined, undefined)
            .then(() => {
                done("Exception expected");
            })
            .catch(() => {
                done();
            });
    });

    test("should verify parseProjectsWithRelatedBuilds not shuffled", async function () {
        const topProject = getTopProjectXml();
        const level1Project = getProjectXml("project1", "_Root");
        const level2Project = getProjectXml("project2", "project1");
        const level3Project = getProjectXml("project3", "project2", true);
        const result: Project[] = await xmlParser.parseProjectsWithRelatedBuilds(
            [topProject, level1Project, level2Project, level3Project], () => {
                return true;
            });
        assert.equal(result.length, 1);
        assert.equal(result[0].id, "project1");
        assert.equal(result[0].children.length, 1);
        assert.equal(result[0].children[0].id, "project2");
        assert.equal(result[0].children[0].children.length, 1);
        assert.equal(result[0].children[0].children[0].id, "project3");
        assert.equal(result[0].children[0].children[0].children.length, 1);
        assert.ok(result[0].children[0].children[0].children[0] instanceof BuildConfig);
    });

    test("should verify parseProjectsWithRelatedBuilds shuffled", async function () {
        const topProject = getTopProjectXml();
        const level1Project = getProjectXml("project1", "_Root");
        const level2Project = getProjectXml("project2", "project1");
        const level3Project = getProjectXml("project3", "project2", true);
        const result: Project[] = await xmlParser.parseProjectsWithRelatedBuilds(
            [level3Project, level1Project, topProject, level2Project], () => {
                return true;
            });
        assert.equal(result.length, 1);
        assert.equal(result[0].id, "project1");
        assert.equal(result[0].children.length, 1);
        assert.equal(result[0].children[0].id, "project2");
        assert.equal(result[0].children[0].children.length, 1);
        assert.equal(result[0].children[0].children[0].id, "project3");
        assert.ok(result[0].children[0].children[0].children[0] instanceof BuildConfig);
    });
});

function getTopProjectXml() {
    // tslint:disable-next-line
    return getProjectXml("_Root", null);
}

function getProjectXml(projectId: string, parentId: string, withConfig = false) {
    const name = "name";
    const externalId = "externalId";

    return `<Project>
   <myProjectId>${projectId}</myProjectId>
   <myExternalId>${externalId}</myExternalId>
   <myParentProjectId>${parentId}</myParentProjectId>
   <name>${name}</name>
   <configs>${withConfig ? getConfigXml("configId", "configExternalId", "configName", projectId) : ""}</configs>
   </Project>`;
}

function getConfigXml(id: string, externalId: string, name: string, parentId: string) {
    return `<Configuration>
         <id>${id}</id>
         <myExternalId>${externalId}</myExternalId>
         <projectName>any_name</projectName>
         <projectId>${parentId}</projectId>
         <myProjectExternalId>any_external_name</myProjectExternalId>
         <myRunnerTypes class="list">
            <string>gradle-runner</string>
         </myRunnerTypes>
         <name>${name}</name>
         <checkoutType>ON_SERVER</checkoutType>
         <isLastFinishedLoaded>false</isLastFinishedLoaded>
         <isLastSuccessfullyFinishedLoaded>false</isLastSuccessfullyFinishedLoaded>
         <paused>false</paused>
         <queued>false</queued>
      </Configuration>`;
}
