"use strict";

import {SelectFilesForRemoteRun} from "../../../src/bll/commands/selectfilesforremoterun";
import * as tsMockito from "ts-mockito";
import {anything} from "ts-mockito";
import {CvsProviderProxy} from "../../../src/dal/cvsproviderproxy";
import {ChangesProvider} from "../../../src/view/dataproviders/resourceprovider";

suite("Select Files For Remote Run", () => {
    test("should verify we request data from cvsproviders and put it to rhe resource provider", function (done) {
        const mockedProviderProxy: CvsProviderProxy = tsMockito.mock(CvsProviderProxy);
        const providerProxySpy: CvsProviderProxy = tsMockito.instance(mockedProviderProxy);
        const mockedResourceProvider: ChangesProvider = tsMockito.mock(ChangesProvider);
        const resourceProviderMock: ChangesProvider = tsMockito.instance(mockedResourceProvider);

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