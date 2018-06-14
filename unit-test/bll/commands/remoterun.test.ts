import "reflect-metadata";
import * as tsMockito from "ts-mockito";
import {anything, verify, when} from "ts-mockito";
import {CvsProviderProxy} from "../../../src/dal/cvsproviderproxy";
import {RemoteRun} from "../../../src/bll/commands/remoterun";
import {CustomPatchSender} from "../../../src/bll/remoterun/patchsender";
import * as TypeMoq from "typemoq";
import {IResourceProvider} from "../../../src/view/dataproviders/interfaces/iresourceprovider";
import {IBuildProvider} from "../../../src/view/dataproviders/interfaces/ibuildprovider";
import {IProviderManager} from "../../../src/view/iprovidermanager";
import {PatchManager} from "../../../src/bll/utils/patchmanager";
import {WindowProxy} from "../../../src/bll/moduleproxies/window-proxy";
import {ChangeListStatus} from "../../../src/bll/utils/constants";

const rmock = require("mock-require");
rmock("vscode", { });

suite("Run Remote Run", () => {
    test("should verify we request getting source data and trigger output methods", function (done) {
        const cvsProviderProxyMock: CvsProviderProxy = tsMockito.mock(CvsProviderProxy);
        const cvsProviderProxySpy: CvsProviderProxy = tsMockito.instance(cvsProviderProxyMock);

        const patchSenderMock: CustomPatchSender = tsMockito.mock(CustomPatchSender);
        when(patchSenderMock.sendPatch(anything(), anything(), anything())).thenReturn(Promise.resolve([]));
        when(patchSenderMock.waitForChangeFinish(anything())).thenReturn(Promise.resolve(ChangeListStatus.CHECKED));
        const patchSenderSpy: CustomPatchSender = tsMockito.instance(patchSenderMock);

        const resourceProviderMock: TypeMoq.IMock<IResourceProvider> = TypeMoq.Mock.ofType<IResourceProvider>();
        resourceProviderMock.setup((foo) => foo.getSelectedContent()).returns(() => [anything(), anything()]);
        const resourceProviderSpy: IResourceProvider = resourceProviderMock.object;

        const buildProviderMock: TypeMoq.IMock<IBuildProvider> = TypeMoq.Mock.ofType<IBuildProvider>();
        buildProviderMock.setup((bar) => bar.getSelectedContent()).returns(() => [anything(), anything()]);
        const buildProviderSpy: IBuildProvider = buildProviderMock.object;

        const providerManagerMock: TypeMoq.IMock<IProviderManager> = TypeMoq.Mock.ofType<IProviderManager>();
        const providerManagerSpy: IProviderManager = providerManagerMock.object;

        const patchManagerMock: PatchManager = tsMockito.mock(PatchManager);
        const patchManagerSpy: PatchManager = tsMockito.instance(patchManagerMock);

        const windowMock: WindowProxy = tsMockito.mock(WindowProxy);
        const windowSpy: WindowProxy = tsMockito.instance(windowMock);

        const testableCommand = new RemoteRun(cvsProviderProxySpy, buildProviderSpy, resourceProviderSpy,
                                              providerManagerSpy, patchSenderSpy, patchManagerSpy, windowSpy);
        testableCommand.exec([false]).then(() => {
            verify(patchManagerMock.preparePatch(anything())).called();
            buildProviderMock.verify((foo) => foo.getSelectedContent(), TypeMoq.Times.atLeastOnce());
            tsMockito.verify(patchSenderMock.sendPatch(anything(), anything(), anything())).called();
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });

    test("should verify we reject calling sendPatch without suitable build configs", function (done) {
        const cvsProviderProxyMock: CvsProviderProxy = tsMockito.mock(CvsProviderProxy);
        const cvsProviderProxySpy: CvsProviderProxy = tsMockito.instance(cvsProviderProxyMock);

        const resourceProviderMock: TypeMoq.IMock<IResourceProvider> = TypeMoq.Mock.ofType<IResourceProvider>();
        const resourceProviderSpy: IResourceProvider = resourceProviderMock.object;

        const buildProviderMock: TypeMoq.IMock<IBuildProvider> = TypeMoq.Mock.ofType<IBuildProvider>();
        buildProviderMock.setup((bar) => bar.getSelectedContent()).returns(() => []);
        const buildProviderSpy: IBuildProvider = buildProviderMock.object;

        const patchSenderMock: CustomPatchSender = tsMockito.mock(CustomPatchSender);
        when(patchSenderMock.sendPatch(anything(), anything(), anything())).thenReturn(Promise.resolve([]));
        const patchSenderSpy: CustomPatchSender = tsMockito.instance(patchSenderMock);

        const providerManagerMock: TypeMoq.IMock<IProviderManager> = TypeMoq.Mock.ofType<IProviderManager>();
        const providerManagerSpy: IProviderManager = providerManagerMock.object;

        const windowMock: WindowProxy = tsMockito.mock(WindowProxy);
        const windowSpy: WindowProxy = tsMockito.instance(windowMock);

        const testableCommand = new RemoteRun(cvsProviderProxySpy, buildProviderSpy, resourceProviderSpy,
                                              providerManagerSpy, patchSenderSpy, undefined, windowSpy);
        testableCommand.exec([false]).then(() => {
            done("There should be an error!");
        }).catch(() => {
            tsMockito.verify(patchSenderMock.sendPatch(anything(), anything(), anything())).never();
            done();
        });
    });

    test("should verify we clean providers when data has been read", function (done) {
        const cvsProviderProxyMock: CvsProviderProxy = tsMockito.mock(CvsProviderProxy);
        const cvsProviderProxySpy: CvsProviderProxy = tsMockito.instance(cvsProviderProxyMock);

        const resourceProviderMock: TypeMoq.IMock<IResourceProvider> = TypeMoq.Mock.ofType<IResourceProvider>();
        resourceProviderMock.setup((foo) => foo.getSelectedContent()).returns(() => [anything(), anything()]);
        const resourceProviderSpy: IResourceProvider = resourceProviderMock.object;

        const buildProviderMock: TypeMoq.IMock<IBuildProvider> = TypeMoq.Mock.ofType<IBuildProvider>();
        buildProviderMock.setup((bar) => bar.getSelectedContent()).returns(() => [anything(), anything()]);
        const buildProviderSpy: IBuildProvider = buildProviderMock.object;

        const patchSenderMock: CustomPatchSender = tsMockito.mock(CustomPatchSender);
        when(patchSenderMock.sendPatch(anything(), anything(), anything())).thenReturn(Promise.resolve([]));
        when(patchSenderMock.waitForChangeFinish(anything())).thenReturn(Promise.resolve(ChangeListStatus.CHECKED));
        const patchSenderSpy: CustomPatchSender = tsMockito.instance(patchSenderMock);

        const providerManagerMock: TypeMoq.IMock<IProviderManager> = TypeMoq.Mock.ofType<IProviderManager>();
        const providerManagerSpy: IProviderManager = providerManagerMock.object;

        const patchManagerMock: PatchManager = tsMockito.mock(PatchManager);
        const patchManagerSpy: PatchManager = tsMockito.instance(patchManagerMock);

        const windowMock: WindowProxy = tsMockito.mock(WindowProxy);
        const windowSpy: WindowProxy = tsMockito.instance(windowMock);

        const testableCommand = new RemoteRun(cvsProviderProxySpy, buildProviderSpy, resourceProviderSpy,
                                              providerManagerSpy, patchSenderSpy, patchManagerSpy, windowSpy);
        testableCommand.exec([false]).then(() => {
            buildProviderMock.verify((foo) => foo.resetTreeContent(), TypeMoq.Times.atLeastOnce());
            resourceProviderMock.verify((foo) => foo.resetTreeContent(), TypeMoq.Times.atLeastOnce());
            providerManagerMock.verify((foo) => foo.showEmptyDataProvider(), TypeMoq.Times.atLeastOnce());
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });
});
