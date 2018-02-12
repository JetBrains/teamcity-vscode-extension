import {assert} from "chai";
import * as tsMockito from "ts-mockito";
import {instance, mock, when} from "ts-mockito";
import {ResourceProvider} from "../../../src/view/dataproviders/resourceprovider";
import {CheckInInfo} from "../../../src/bll/entities/checkininfo";
import {CvsSupportProvider} from "../../../src/dal/cvsprovider";
import {GitProvider} from "../../../src/dal/gitprovider";
import {CvsResource} from "../../../src/bll/entities/cvsresources/cvsresource";
import {AddedCvsResource} from "../../../src/bll/entities/cvsresources/addedcvsresource";
import {CheckInInfoItem} from "../../../src/bll/entities/presentable/checkininfoitem";
import { CvsResourceItem } from "../../../src/bll/entities/cvsresources/cvsresourceitem";
import {DataProviderEnum} from "../../../src/bll/utils/constants";

suite("ResourceProviders", () => {

    test("should verify resource data provider constructor", function () {
        const resourceProvider = new ResourceProvider();
        assert.notEqual(resourceProvider, undefined);
    });

    test("should verify getType", function () {
        const resourceProvider = new ResourceProvider();
        assert.equal(resourceProvider.getType(), DataProviderEnum.ResourcesProvider);
    });

    test("should verify setContent", function () {
        const resourceProvider = new ResourceProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        const checkInInfo: CheckInInfo[] = [new CheckInInfo([], cvsProviderSpy), new CheckInInfo([], cvsProviderSpy)];
        resourceProvider.setContent(checkInInfo);
        const expectedCheckInInfoItems: CheckInInfoItem[] = [];
        checkInInfo.forEach((changes) => expectedCheckInInfoItems.push(new CheckInInfoItem(changes)));
        assert.deepEqual(resourceProvider.getChildren(), expectedCheckInInfoItems);
    });

    test("should verify resetContent", function () {
        const resourceProvider = new ResourceProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        const checkInInfo: CheckInInfo[] = [new CheckInInfo([], cvsProviderSpy), new CheckInInfo([], cvsProviderSpy)];
        resourceProvider.setContent(checkInInfo);
        resourceProvider.resetTreeContent();
        assert.deepEqual(resourceProvider.getChildren(), []);
    });

    test("should verify getChildren with no arguments", function () {
        const resourceProvider = new ResourceProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        const checkInInfo: CheckInInfo[] = [new CheckInInfo([], cvsProviderSpy), new CheckInInfo([], cvsProviderSpy)];
        resourceProvider.setContent(checkInInfo);
        const expectedCheckInInfoItems: CheckInInfoItem[] = [];
        checkInInfo.forEach((changes) => expectedCheckInInfoItems.push(new CheckInInfoItem(changes)));
        assert.deepEqual(resourceProvider.getChildren(), expectedCheckInInfoItems);
    });

    test("should verify getChildren with TreeItem argument", function () {
        const resourceProvider = new ResourceProvider();
        const cvsProviderMock: CvsSupportProvider = mock(GitProvider);
        when(cvsProviderMock.getRootPath()).thenReturn("");
        const cvsProviderSpy: CvsSupportProvider = instance(cvsProviderMock);
        const aResources: CvsResource[] = [new AddedCvsResource(undefined, undefined)];
        const aResourceItems: CvsResourceItem[] = [];
        aResources.forEach((resource) => aResourceItems.push(new CvsResourceItem(resource)));
        const stabbedCheckInInfo: CheckInInfo = new CheckInInfo(aResources, cvsProviderSpy);
        const stabbedCheckInInfoItem = new CheckInInfoItem(stabbedCheckInInfo);
        assert.deepEqual(resourceProvider.getChildren(stabbedCheckInInfoItem), aResourceItems);
    });

    test("should verify getSelectedContent with all selected content", function () {
        const resourceProvider = new ResourceProvider();
        const mockedCvsProvider: CvsSupportProvider = tsMockito.mock(GitProvider);
        const cvsProviderSpy: CvsSupportProvider = tsMockito.instance(mockedCvsProvider);
        const includedResource = new AddedCvsResource(undefined, undefined);
        const includedResource2 = new AddedCvsResource(undefined, undefined);

        const mockedCheckInInfo: CheckInInfo = new CheckInInfo([includedResource, includedResource2], cvsProviderSpy);
        const expectedCheckInInfo: CheckInInfo = new CheckInInfo([includedResource, includedResource2], cvsProviderSpy);

        resourceProvider.setContent([mockedCheckInInfo]);
        assert.deepEqual(resourceProvider.getSelectedContent(), [expectedCheckInInfo]);
    });
});
