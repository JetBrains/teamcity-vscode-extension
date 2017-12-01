"use strict";
import {SelectFilesForRemoteRun} from "../../../src/bll/commands/selectfilesforremoterun";
import * as tsMockito from "ts-mockito";
import {CvsProviderProxy} from "../../../src/dal/cvsproviderproxy";
import {ResourceProvider} from "../../../src/view/dataproviders/resourceprovider";
import {anything} from "ts-mockito";

suite("Select Files For Remote Run", () => {
    test("should verify command", function (done) {
        const mockedProviderProxy: CvsProviderProxy = tsMockito.mock(CvsProviderProxy);
        const providerProxySpy: CvsProviderProxy = tsMockito.instance(mockedProviderProxy);
        const mockedResourceProvider: ResourceProvider = tsMockito.mock(ResourceProvider);
        const resourceProviderMock: ResourceProvider = tsMockito.instance(mockedResourceProvider);

        const testableCommand = new SelectFilesForRemoteRun(providerProxySpy, resourceProviderMock);
        testableCommand.exec().then(() => {
            tsMockito.verify(mockedProviderProxy.getRequiredCheckInInfo()).called();
            tsMockito.verify(mockedResourceProvider.setContent(anything())).called();
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });
});
