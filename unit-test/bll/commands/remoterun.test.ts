import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });
import * as tsMockito from "ts-mockito";
import {anything, when} from "ts-mockito";
import {CvsProviderProxy} from "../../../src/dal/cvsproviderproxy";
import {RemoteRun} from "../../../src/bll/commands/remoterun";
import {PatchSender} from "../../../src/bll/remoterun/patchsender";
import {CustomPatchSender} from "../../../src/bll/remoterun/patchsenderimpl";
import * as TypeMoq from "typemoq";
import {IResourceProvider} from "../../../src/view/dataproviders/interfaces/iresourceprovider";
import {IBuildProvider} from "../../../src/view/dataproviders/interfaces/ibuildprovider";
import {IProviderManager} from "../../../src/view/iprovidermanager";

suite("Select Files For Remote Run", () => {
    test("should verify we request data from buildProvider and put it to rhe resource provider", function (done) {
        const cvsProviderProxyMock: CvsProviderProxy = tsMockito.mock(CvsProviderProxy);
        const cvsProviderProxySpy: CvsProviderProxy = tsMockito.instance(cvsProviderProxyMock);

        const patchSenderMock: PatchSender = tsMockito.mock(CustomPatchSender);
        when(patchSenderMock.remoteRun(anything(), anything())).thenReturn(Promise.resolve(true));
        const patchSenderSpy: PatchSender = tsMockito.instance(patchSenderMock);

        const resourceProviderMock: TypeMoq.IMock<IResourceProvider> = TypeMoq.Mock.ofType<IResourceProvider>();
        const resourceProviderSpy: IResourceProvider = resourceProviderMock.object;

        const buildProviderMock: TypeMoq.IMock<IBuildProvider> = TypeMoq.Mock.ofType<IBuildProvider>();
        buildProviderMock.setup((bar) => bar.getSelectedContent()).returns(() => [anything(), anything()]);
        const buildProviderSpy: IBuildProvider = buildProviderMock.object;

        const providerManagerMock: TypeMoq.IMock<IProviderManager> = TypeMoq.Mock.ofType<IProviderManager>();
        const providerManagerSpy: IProviderManager = providerManagerMock.object;

        const testableCommand = new RemoteRun(cvsProviderProxySpy, buildProviderSpy, resourceProviderSpy, providerManagerSpy, patchSenderSpy);
        testableCommand.exec().then(() => {
            buildProviderMock.verify((foo) => foo.getSelectedContent(), TypeMoq.Times.atLeastOnce());
            tsMockito.verify(patchSenderMock.remoteRun(anything(), anything())).called();
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });

    test("should verify we reject calling remoteRun without suitable build configs", function (done) {
        const cvsProviderProxyMock: CvsProviderProxy = tsMockito.mock(CvsProviderProxy);
        const cvsProviderProxySpy: CvsProviderProxy = tsMockito.instance(cvsProviderProxyMock);

        const resourceProviderMock: TypeMoq.IMock<IResourceProvider> = TypeMoq.Mock.ofType<IResourceProvider>();
        const resourceProviderSpy: IResourceProvider = resourceProviderMock.object;

        const buildProviderMock: TypeMoq.IMock<IBuildProvider> = TypeMoq.Mock.ofType<IBuildProvider>();
        buildProviderMock.setup((bar) => bar.getSelectedContent()).returns(() => []);
        const buildProviderSpy: IBuildProvider = buildProviderMock.object;

        const patchSenderMock: PatchSender = tsMockito.mock(CustomPatchSender);
        when(patchSenderMock.remoteRun(anything(), anything())).thenReturn(Promise.resolve(true));
        const patchSenderSpy: PatchSender = tsMockito.instance(patchSenderMock);

        const providerManagerMock: TypeMoq.IMock<IProviderManager> = TypeMoq.Mock.ofType<IProviderManager>();
        const providerManagerSpy: IProviderManager = providerManagerMock.object;

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

        const resourceProviderMock: TypeMoq.IMock<IResourceProvider> = TypeMoq.Mock.ofType<IResourceProvider>();
        const resourceProviderSpy: IResourceProvider = resourceProviderMock.object;

        const buildProviderMock: TypeMoq.IMock<IBuildProvider> = TypeMoq.Mock.ofType<IBuildProvider>();
        buildProviderMock.setup((bar) => bar.getSelectedContent()).returns(() => [anything(), anything()]);
        const buildProviderSpy: IBuildProvider = buildProviderMock.object;

        const patchSenderMock: PatchSender = tsMockito.mock(CustomPatchSender);
        when(patchSenderMock.remoteRun(anything(), anything())).thenReturn(Promise.resolve(true));
        const patchSenderSpy: PatchSender = tsMockito.instance(patchSenderMock);

        const providerManagerMock: TypeMoq.IMock<IProviderManager> = TypeMoq.Mock.ofType<IProviderManager>();
        const providerManagerSpy: IProviderManager = providerManagerMock.object;

        const testableCommand = new RemoteRun(cvsProviderProxySpy, buildProviderSpy, resourceProviderSpy, providerManagerSpy, patchSenderSpy);
        testableCommand.exec().then(() => {
            buildProviderMock.verify((foo) => foo.resetTreeContent(), TypeMoq.Times.atLeastOnce());
            resourceProviderMock.verify((foo) => foo.resetTreeContent(), TypeMoq.Times.atLeastOnce());
            providerManagerMock.verify((foo) => foo.showEmptyDataProvider(), TypeMoq.Times.atLeastOnce());
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });
});
