import {assert} from "chai";
import {anything} from "ts-mockito";
import {BuildProvider} from "../../../src/view/dataproviders/buildprovider";
import {Project} from "../../../src/bll/entities/project";
import {ProjectItem} from "../../../src/bll/entities/projectitem";
import {DataProviderEnum} from "../../../src/bll/utils/constants";

suite("BuildProvider", () => {

    test("should verify build provider constructor", function () {
        const buildProvider = new BuildProvider();
        assert.notEqual(buildProvider, undefined);
    });

    test("should verify getType", function () {
        const buildProvider = new BuildProvider();
        assert.equal(buildProvider.getType(), DataProviderEnum.BuildsProvider);
    });

    test("should verify setContent / getChildren", function () {
        const buildProvider = new BuildProvider();
        const projects: Project[] = [new Project(anything(), anything(), anything()), new Project(anything(), anything(), anything())];
        buildProvider.setContent(projects);
        const expectedArray: ProjectItem[] = [];
        projects.forEach((project) => expectedArray.push(new ProjectItem(project)));
        assert.deepEqual(buildProvider.getChildren(), expectedArray);
    });

    test("should verify resetContent", function () {
        const buildProvider = new BuildProvider();
        const projects: Project[] = [new Project(anything(), anything(), anything()), new Project(anything(), anything(), anything())];
        buildProvider.setContent(projects);
        buildProvider.resetTreeContent();
        assert.deepEqual(buildProvider.getChildren(), []);
    });
});
