"use strict";

import {assert} from "chai";
import {anything, instance, mock, when} from "ts-mockito";
import {DataProviderEnum} from "../../../src/view/providermanager";
import {CheckInInfo} from "../../../src/bll/entities/checkininfo";
import {CvsSupportProvider} from "../../../src/dal/cvsprovider";
import {GitProvider} from "../../../src/dal/gitprovider";
import {CvsResource} from "../../../src/bll/entities/cvsresources/cvsresource";
import {AddedCvsResource} from "../../../src/bll/entities/cvsresources/addedcvsresource";
import {BuildConfigItem} from "../../../src/bll/entities/buildconfigitem";
import {BuildProvider} from "../../../src/view/dataproviders/buildprovider";
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

    test("should verify setContent", function () {
        const buildProvider = new BuildProvider();
        const projectItems: ProjectItem[] = [new ProjectItem(anything(), anything()), new ProjectItem(anything(), anything())];
        buildProvider.setContent(projectItems);
        assert.deepEqual(buildProvider.getChildren(), projectItems);
    });

    test("should verify resetContent", function () {
        const buildProvider = new BuildProvider();
        const projectItems: ProjectItem[] = [new ProjectItem(anything(), anything()), new ProjectItem(anything(), anything())];
        buildProvider.setContent(projectItems);
        buildProvider.resetTreeContent();
        assert.deepEqual(buildProvider.getChildren(), []);
    });

    test("should verify getChildren with no arguments", function () {
        const buildProvider = new BuildProvider();
        const projectItems: ProjectItem[] = [new ProjectItem(anything(), anything()), new ProjectItem(anything(), anything())];
        buildProvider.setContent(projectItems);
        assert.deepEqual(buildProvider.getChildren(), projectItems);
    });

    test("should verify getChildren with TreeItem argument", function () {
        const buildProvider = new BuildProvider();
        const children: BuildConfigItem[] = [new BuildConfigItem(anything(), anything(), anything())];
        const projectItemSpy: ProjectItem = new ProjectItem("testObj", children);
        assert.deepEqual(buildProvider.getChildren(projectItemSpy), children);
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

    test("should verify getSelectedContent with all selected content", function () {
        const buildProvider = new BuildProvider();
        const includedBuild = new BuildConfigItem(anything(), anything(), anything());
        includedBuild.changeState();
        const includedBuild2 = new BuildConfigItem(anything(), anything(), anything());
        includedBuild2.changeState();
        const children: BuildConfigItem[] = [includedBuild, includedBuild2];
        const projectItem: ProjectItem = new ProjectItem("testObj", children);
        buildProvider.setContent([projectItem]);
        assert.deepEqual(buildProvider.getSelectedContent(), children);
    });

    test("should verify getSelectedContent with some selected content", function () {
        const buildProvider = new BuildProvider();
        const includedBuild = new BuildConfigItem(anything(), anything(), anything());
        includedBuild.changeState();
        const excludedBuild = new BuildConfigItem(anything(), anything(), anything());
        const children: BuildConfigItem[] = [includedBuild, excludedBuild];
        const projectItem: ProjectItem = new ProjectItem("testObj", children);
        const expectedChildren: BuildConfigItem[] = [includedBuild];
        buildProvider.setContent([projectItem]);
        assert.deepEqual(buildProvider.getSelectedContent(), expectedChildren);
    });

    test("should verify getSelectedContent with no selected content", function () {
        const buildProvider = new BuildProvider();
        const excludedBuild = new BuildConfigItem(anything(), anything(), anything());
        const excludedBuild2 = new BuildConfigItem(anything(), anything(), anything());
        const children: BuildConfigItem[] = [excludedBuild, excludedBuild2];
        const projectItem: ProjectItem = new ProjectItem("testObj", children);
        const expectedChildren: BuildConfigItem[] = [];
        buildProvider.setContent([projectItem]);
        assert.deepEqual(buildProvider.getSelectedContent(), expectedChildren);
    });
});
