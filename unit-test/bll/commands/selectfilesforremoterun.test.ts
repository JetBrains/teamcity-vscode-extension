import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });
import {SelectFilesForRemoteRun} from "../../../src/bll/commands/selectfilesforremoterun";
import * as tsMockito from "ts-mockito";
import {CvsProviderProxy} from "../../../src/dal/cvsproviderproxy";
import * as TypeMoq from "typemoq";
import {IResourceProvider} from "../../../src/view/dataproviders/interfaces/iresourceprovider";
import {anything, mock, when} from "ts-mockito";
import {WindowProxy} from "../../../src/bll/moduleproxies/window-proxy";

suite("Select Files For Remote Run", () => {
    const windowsProxy = mock(WindowProxy);
    const windowSpy = tsMockito.instance(windowsProxy);

    test("should verify we request data from cvsproviders and put it to rhe resource provider", (done) => {
        const mockedProviderProxy: CvsProviderProxy = tsMockito.mock(CvsProviderProxy);
        when(mockedProviderProxy.getRequiredCheckInInfo()).thenReturn(Promise.resolve([anything()]));
        const providerProxySpy: CvsProviderProxy = tsMockito.instance(mockedProviderProxy);
        const resourceProviderMock: TypeMoq.IMock<IResourceProvider> = TypeMoq.Mock.ofType<IResourceProvider>();
        const resourceProviderSpy: IResourceProvider = resourceProviderMock.object;

        const testableCommand = new SelectFilesForRemoteRun(providerProxySpy, resourceProviderSpy, windowSpy);
        testableCommand.exec().then(() => {
            tsMockito.verify(mockedProviderProxy.getRequiredCheckInInfo()).called();
            resourceProviderMock.verify((foo) => foo.setContent(TypeMoq.It.isAny()), TypeMoq.Times.atLeastOnce());
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });
});
