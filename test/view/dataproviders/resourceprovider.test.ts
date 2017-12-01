"use strict";

import {assert} from "chai";
import * as tsMockito from "ts-mockito";
import {ResourceProvider} from "../../../src/view/dataproviders/resourceprovider";
import {DataProviderEnum} from "../../../src/view/providermanager";
import {CheckInInfo} from "../../../src/bll/entities/checkininfo";
import {CvsSupportProvider} from "../../../src/dal/cvsprovider";
import {GitProvider} from "../../../src/dal/gitprovider";
import {anything} from "ts-mockito";
import {CvsResource} from "../../../src/bll/entities/cvsresources/cvsresource";
import {AddedCvsResource} from "../../../src/bll/entities/cvsresources/addedcvsresource";
import {BuildConfigItem} from "../../../src/bll/entities/buildconfigitem";

suite("ResourceProviders", () => {

    test("should verify resource data provider constructor", function () {
        let resourceProvider = new ResourceProvider();
        assert.notEqual(resourceProvider, undefined);
    });

    test("should verify getType", function () {
        let resourceProvider = new ResourceProvider();
        assert.equal(resourceProvider.getType(), DataProviderEnum.ResourcesProvider);
    });

    test("should verify setContent", function () {
        let resourceProvider = new ResourceProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        let checkInInfo: CheckInInfo[] = [new CheckInInfo(undefined, cvsProviderSpy), new CheckInInfo(undefined, cvsProviderSpy)];
        resourceProvider.setContent(checkInInfo);
        assert.deepEqual(resourceProvider.getChildren(), checkInInfo);
    });

    test("should verify resetContent", function () {
        let resourceProvider = new ResourceProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        let checkInInfo: CheckInInfo[] = [new CheckInInfo(undefined, cvsProviderSpy), new CheckInInfo(undefined, cvsProviderSpy)];
        resourceProvider.setContent(checkInInfo);
        resourceProvider.resetTreeContent();
        assert.deepEqual(resourceProvider.getChildren(), []);
    });


    test("should verify getChildren with no arguments", function () {
        let resourceProvider = new ResourceProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        let checkInInfo: CheckInInfo[] = [new CheckInInfo(undefined, cvsProviderSpy), new CheckInInfo(undefined, cvsProviderSpy)];
        resourceProvider.setContent(checkInInfo);
        assert.deepEqual(resourceProvider.getChildren(), checkInInfo);
    });

    test("should verify getChildren with TreeItem argument", function () {
        let resourceProvider = new ResourceProvider();
        const mockedCheckInInfo: CheckInInfo = tsMockito.mock(CheckInInfo);
        const checkInInfoSpy: CheckInInfo = tsMockito.instance(mockedCheckInInfo);
        assert.notEqual(resourceProvider.getChildren(checkInInfoSpy), undefined);

        mockedCheckInInfo.cvsLocalResources = [new AddedCvsResource(undefined, undefined)];
        assert.notEqual(resourceProvider.getChildren(checkInInfoSpy), undefined);
    });

    test("should verify getChildren with incompatible argument", function () {
        let resourceProvider = new ResourceProvider();
        const buildConfigItem: BuildConfigItem = tsMockito.mock(BuildConfigItem);
        const buildConfigItemSpy: BuildConfigItem = tsMockito.instance(buildConfigItem);
        assert.deepEqual(resourceProvider.getChildren(buildConfigItemSpy), []);
    });

    test("should verify getSelectedContent with all selected content", function () {
        let resourceProvider = new ResourceProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        const mockedCheckInInfo: CheckInInfo = new CheckInInfo(undefined, cvsProviderSpy);
        let includedResource = new AddedCvsResource(undefined, undefined);
        let includedResource2 = new AddedCvsResource(undefined, undefined);
        mockedCheckInInfo.cvsLocalResources = [includedResource, includedResource2];

        const expectedCheckInInfo: CheckInInfo = new CheckInInfo(undefined, cvsProviderSpy);
        expectedCheckInInfo.cvsLocalResources = [includedResource, includedResource2];

        resourceProvider.setContent([mockedCheckInInfo]);
        assert.deepEqual(resourceProvider.getSelectedContent(), [expectedCheckInInfo]);
    });

    test("should verify getSelectedContent with some selected content", function () {
        let resourceProvider = new ResourceProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        const mockedCheckInInfo: CheckInInfo = new CheckInInfo(undefined, cvsProviderSpy);
        let includedResource = new AddedCvsResource(undefined, undefined);
        let excludedResource = new AddedCvsResource(undefined, undefined);
        excludedResource.changeState();
        mockedCheckInInfo.cvsLocalResources = [includedResource, excludedResource];

        const expectedCheckInInfo: CheckInInfo = new CheckInInfo(undefined, cvsProviderSpy);
        expectedCheckInInfo.cvsLocalResources = [includedResource];

        resourceProvider.setContent([mockedCheckInInfo]);
        assert.deepEqual(resourceProvider.getSelectedContent(), [expectedCheckInInfo]);
    });

    test("should verify getSelectedContent with no selected content", function () {
        let resourceProvider = new ResourceProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        const mockedCheckInInfo: CheckInInfo = new CheckInInfo(undefined, cvsProviderSpy);
        let excludedResource = new AddedCvsResource(undefined, undefined);
        let excludedResource2 = new AddedCvsResource(undefined, undefined);
        excludedResource.changeState();
        excludedResource2.changeState();
        mockedCheckInInfo.cvsLocalResources = [excludedResource, excludedResource2];
        resourceProvider.setContent([mockedCheckInInfo]);
        assert.throws(function () {
            resourceProvider.getSelectedContent();
        });
    });
});
