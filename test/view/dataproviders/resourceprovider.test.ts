"use strict";

import {assert} from "chai";
import * as tsMockito from "ts-mockito";
import {ChangesProvider} from "../../../src/view/dataproviders/resourceprovider";
import {DataProviderEnum} from "../../../src/view/providermanager";
import {CheckInInfo} from "../../../src/bll/entities/checkininfo";
import {CvsSupportProvider} from "../../../src/dal/cvsprovider";
import {GitProvider} from "../../../src/dal/gitprovider";
import {anything, instance, mock, when} from "ts-mockito";
import {CvsResource} from "../../../src/bll/entities/cvsresources/cvsresource";
import {AddedCvsResource} from "../../../src/bll/entities/cvsresources/addedcvsresource";
import {BuildConfigItem} from "../../../src/bll/entities/buildconfigitem";
import {ProjectItem} from "../../../src/bll/entities/projectitem";

suite("ResourceProviders", () => {

    test("should verify resource data provider constructor", function () {
        const resourceProvider = new ChangesProvider();
        assert.notEqual(resourceProvider, undefined);
    });

    test("should verify getType", function () {
        const resourceProvider = new ChangesProvider();
        assert.equal(resourceProvider.getType(), DataProviderEnum.ResourcesProvider);
    });

    test("should verify setContent", function () {
        const resourceProvider = new ChangesProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        const checkInInfo: CheckInInfo[] = [new CheckInInfo(undefined, cvsProviderSpy), new CheckInInfo(undefined, cvsProviderSpy)];
        resourceProvider.setContent(checkInInfo);
        assert.deepEqual(resourceProvider.getChildren(), checkInInfo);
    });

    test("should verify resetContent", function () {
        const resourceProvider = new ChangesProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        const checkInInfo: CheckInInfo[] = [new CheckInInfo(undefined, cvsProviderSpy), new CheckInInfo(undefined, cvsProviderSpy)];
        resourceProvider.setContent(checkInInfo);
        resourceProvider.resetTreeContent();
        assert.deepEqual(resourceProvider.getChildren(), []);
    });

    test("should verify getChildren with no arguments", function () {
        const resourceProvider = new ChangesProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        const checkInInfo: CheckInInfo[] = [new CheckInInfo(undefined, cvsProviderSpy), new CheckInInfo(undefined, cvsProviderSpy)];
        resourceProvider.setContent(checkInInfo);
        assert.deepEqual(resourceProvider.getChildren(), checkInInfo);
    });

    test("should verify getChildren with TreeItem argument", function () {
        const resourceProvider = new ChangesProvider();
        const cvsProviderMock: CvsSupportProvider = mock(GitProvider);
        when(cvsProviderMock.getRootPath()).thenReturn("");
        const cvsProviderSpy: CvsSupportProvider = instance(cvsProviderMock);
        const aResource: CvsResource[] = [new AddedCvsResource(undefined, undefined)];
        const stabbedCheckInInfo: CheckInInfo = new CheckInInfo(aResource, cvsProviderSpy);
        assert.deepEqual(resourceProvider.getChildren(stabbedCheckInInfo), aResource);
    });

    test("should verify getChildren with incompatible argument", function () {
        const resourceProvider = new ChangesProvider();
        const children: BuildConfigItem[] = [new BuildConfigItem(anything(), anything(), anything())];
        const projectItemSpy: ProjectItem = new ProjectItem("testObj", children);
        assert.deepEqual(resourceProvider.getChildren(projectItemSpy), []);
    });

    test("should verify getSelectedContent with all selected content", function () {
        const resourceProvider = new ChangesProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        const mockedCheckInInfo: CheckInInfo = new CheckInInfo(undefined, cvsProviderSpy);
        const includedResource = new AddedCvsResource(undefined, undefined);
        const includedResource2 = new AddedCvsResource(undefined, undefined);
        mockedCheckInInfo.cvsLocalResources = [includedResource, includedResource2];

        const expectedCheckInInfo: CheckInInfo = new CheckInInfo(undefined, cvsProviderSpy);
        expectedCheckInInfo.cvsLocalResources = [includedResource, includedResource2];

        resourceProvider.setContent([mockedCheckInInfo]);
        assert.deepEqual(resourceProvider.getSelectedContent(), [expectedCheckInInfo]);
    });

    test("should verify getSelectedContent with some selected content", function () {
        const resourceProvider = new ChangesProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        const mockedCheckInInfo: CheckInInfo = new CheckInInfo(undefined, cvsProviderSpy);
        const includedResource = new AddedCvsResource(undefined, undefined);
        const excludedResource = new AddedCvsResource(undefined, undefined);
        excludedResource.changeState();
        mockedCheckInInfo.cvsLocalResources = [includedResource, excludedResource];

        const expectedCheckInInfo: CheckInInfo = new CheckInInfo(undefined, cvsProviderSpy);
        expectedCheckInInfo.cvsLocalResources = [includedResource];

        resourceProvider.setContent([mockedCheckInInfo]);
        assert.deepEqual(resourceProvider.getSelectedContent(), [expectedCheckInInfo]);
    });

    test("should verify getSelectedContent with no selected content", function () {
        const resourceProvider = new ChangesProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        const mockedCheckInInfo: CheckInInfo = new CheckInInfo(undefined, cvsProviderSpy);
        const excludedResource = new AddedCvsResource(undefined, undefined);
        const excludedResource2 = new AddedCvsResource(undefined, undefined);
        excludedResource.changeState();
        excludedResource2.changeState();
        mockedCheckInInfo.cvsLocalResources = [excludedResource, excludedResource2];
        resourceProvider.setContent([mockedCheckInInfo]);
        assert.deepEqual(resourceProvider.getSelectedContent(), []);
    });
});
