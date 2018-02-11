import {assert} from "chai";
import {anything, instance, mock, when} from "ts-mockito";
import {DataProviderEnum} from "../../../src/view/providermanager";
import {CheckInInfo} from "../../../src/bll/entities/checkininfo";
import {CvsSupportProvider} from "../../../src/dal/cvsprovider";
import {GitProvider} from "../../../src/dal/gitprovider";
import {CvsResource} from "../../../src/bll/entities/cvsresources/cvsresource";
import {AddedCvsResource} from "../../../src/bll/entities/cvsresources/addedcvsresource";
import {BuildProvider} from "../../../src/view/dataproviders/buildprovider";
import {Project} from "../../../src/bll/entities/project";
import {ProjectItem} from "../../../src/bll/entities/projectitem";

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

    test("should verify getChildren with incompatible argument", function () {
        const buildProvider = new BuildProvider();
        const cvsProviderMock: CvsSupportProvider = mock(GitProvider);
        when(cvsProviderMock.getRootPath()).thenReturn("");
        const cvsProviderSpy: CvsSupportProvider = instance(cvsProviderMock);
        const aResource: CvsResource[] = [new AddedCvsResource(undefined, undefined)];
        const stabbedCheckInInfo: CheckInInfo = new CheckInInfo(aResource, cvsProviderSpy);
        assert.deepEqual(buildProvider.getChildren(stabbedCheckInInfo), []);
    });

});
