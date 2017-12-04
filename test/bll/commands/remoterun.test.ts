"use strict";

import * as tsMockito from "ts-mockito";
import {anything, when} from "ts-mockito";
import {CvsProviderProxy} from "../../../src/dal/cvsproviderproxy";
import {RemoteRun} from "../../../src/bll/commands/remoterun";
import {BuildProvider} from "../../../src/view/dataproviders/buildprovider";
import {PatchSender} from "../../../src/bll/remoterun/patchsender";
import {CustomPatchSender} from "../../../src/bll/remoterun/patchsenderimpl";
import {ChangesProvider} from "../../../src/view/dataproviders/resourceprovider";
import {ProviderManager} from "../../../src/view/providermanager";

suite("Select Files For Remote Run", () => {
    test("should verify we request data from buildProvider and put it to rhe resource provider", function (done) {
        const cvsProviderProxyMock: CvsProviderProxy = tsMockito.mock(CvsProviderProxy);
        const cvsProviderProxySpy: CvsProviderProxy = tsMockito.instance(cvsProviderProxyMock);

        const buildProviderMock: BuildProvider = tsMockito.mock(BuildProvider);
        when(buildProviderMock.getSelectedContent()).thenReturn([anything(), anything()]);
        const buildProviderSpy: BuildProvider = tsMockito.instance(buildProviderMock);

        const patchSenderMock: PatchSender = tsMockito.mock(CustomPatchSender);
        when(patchSenderMock.remoteRun(anything(), anything())).thenReturn(Promise.resolve(true));
        const patchSenderSpy: PatchSender = tsMockito.instance(patchSenderMock);

        const resourceProviderMock: ChangesProvider = tsMockito.mock(ChangesProvider);
        const resourceProviderSpy: ChangesProvider = tsMockito.instance(resourceProviderMock);

        const providerManagerMock: ProviderManager = tsMockito.mock(ProviderManager);
        const providerManagerSpy: ProviderManager = tsMockito.instance(providerManagerMock);

        const testableCommand = new RemoteRun(cvsProviderProxySpy, buildProviderSpy, resourceProviderSpy, providerManagerSpy, patchSenderSpy);
        testableCommand.exec().then(() => {
            tsMockito.verify(buildProviderMock.getSelectedContent()).called();
            tsMockito.verify(patchSenderMock.remoteRun(anything(), anything())).called();
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });

    test("should verify we reject calling remoteRun without suitable build configs", function (done) {
        const cvsProviderProxyMock: CvsProviderProxy = tsMockito.mock(CvsProviderProxy);
        const cvsProviderProxySpy: CvsProviderProxy = tsMockito.instance(cvsProviderProxyMock);

        const buildProviderMock: BuildProvider = tsMockito.mock(BuildProvider);
        when(buildProviderMock.getSelectedContent()).thenReturn([]);
        const buildProviderSpy: BuildProvider = tsMockito.instance(buildProviderMock);

        const patchSenderMock: PatchSender = tsMockito.mock(CustomPatchSender);
        when(patchSenderMock.remoteRun(anything(), anything())).thenReturn(Promise.resolve(true));
        const patchSenderSpy: PatchSender = tsMockito.instance(patchSenderMock);

        const resourceProviderMock: ChangesProvider = tsMockito.mock(ChangesProvider);
        const resourceProviderSpy: ChangesProvider = tsMockito.instance(resourceProviderMock);

        const providerManagerMock: ProviderManager = tsMockito.mock(ProviderManager);
        const providerManagerSpy: ProviderManager = tsMockito.instance(providerManagerMock);

        const testableCommand = new RemoteRun(cvsProviderProxySpy, buildProviderSpy, resourceProviderSpy, providerManagerSpy, patchSenderSpy);
        testableCommand.exec().then(() => {
            tsMockito.verify(patchSenderMock.remoteRun(anything(), anything())).never();
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });

    test("should verify we clean providers when data has been read", function (done) {
        const cvsProviderProxyMock: CvsProviderProxy = tsMockito.mock(CvsProviderProxy);
        const cvsProviderProxySpy: CvsProviderProxy = tsMockito.instance(cvsProviderProxyMock);

        const buildProviderMock: BuildProvider = tsMockito.mock(BuildProvider);
        when(buildProviderMock.getSelectedContent()).thenReturn([anything(), anything()]);
        const buildProviderSpy: BuildProvider = tsMockito.instance(buildProviderMock);

        const patchSenderMock: PatchSender = tsMockito.mock(CustomPatchSender);
        when(patchSenderMock.remoteRun(anything(), anything())).thenReturn(Promise.resolve(true));
        const patchSenderSpy: PatchSender = tsMockito.instance(patchSenderMock);

        const resourceProviderMock: ChangesProvider = tsMockito.mock(ChangesProvider);
        const resourceProviderSpy: ChangesProvider = tsMockito.instance(resourceProviderMock);

        const providerManagerMock: ProviderManager = tsMockito.mock(ProviderManager);
        const providerManagerSpy: ProviderManager = tsMockito.instance(providerManagerMock);

        const testableCommand = new RemoteRun(cvsProviderProxySpy, buildProviderSpy, resourceProviderSpy, providerManagerSpy, patchSenderSpy);
        testableCommand.exec().then(() => {
            tsMockito.verify(buildProviderMock.resetTreeContent()).called();
            tsMockito.verify(resourceProviderMock.resetTreeContent()).called();
            tsMockito.verify(providerManagerMock.showEmptyDataProvider()).called();
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });
});
