import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", {});

import {GetSuitableConfigs} from "../../../src/bll/commands/getsuitableconfigs";
import * as tsMockito from "ts-mockito";
import {anyOfClass, anything, mock, verify, when} from "ts-mockito";
import {CvsProviderProxy} from "../../../src/dal/cvsproviderproxy";
import {RemoteBuildServer} from "../../../src/dal/remotebuildserver";
import {XmlParser} from "../../../src/bll/utils/xmlparser";
import {CheckInInfo} from "../../../src/bll/entities/checkininfo";
import {IResourceProvider} from "../../../src/view/dataproviders/interfaces/iresourceprovider";
import {IBuildProvider} from "../../../src/view/dataproviders/interfaces/ibuildprovider";
import * as TypeMoq from "typemoq";
import {Context} from "../../../src/view/Context";
import {WindowProxy} from "../../../src/bll/moduleproxies/window-proxy";
import {MessageManager} from "../../../src/view/messagemanager";
import * as assert from "assert";
import {Project} from "../../../src/bll/entities/project";
import {CvsResource} from "../../../src/bll/entities/cvsresources/cvsresource";
import {AddedCvsResource} from "../../../src/bll/entities/cvsresources/addedcvsresource";
import {TfvcProvider} from "../../../src/dal/tfsprovider";

suite("Get Suitable Configs", () => {
    let myTestableCommand: GetSuitableConfigs;
    let myResourceProviderMock: TypeMoq.IMock<IResourceProvider>;
    let myRemoteBuildServerMock: RemoteBuildServer;
    let myBuildProviderMock: TypeMoq.IMock<IBuildProvider>;
    let myProviderProxyMock: CvsProviderProxy;
    let myMessageManagerMock: MessageManager;
    let myContextMock: TypeMoq.IMock<Context>;
    let myCheckInInfoMock: CheckInInfo;

    function preSetUp() {
        myProviderProxyMock = mock(CvsProviderProxy);
        const providerProxySpy: CvsProviderProxy = tsMockito.instance(myProviderProxyMock);

        myCheckInInfoMock = mock(CheckInInfo);
        const checkInInfoSpy: CheckInInfo = tsMockito.instance(myCheckInInfoMock);
        myResourceProviderMock = TypeMoq.Mock.ofType<IResourceProvider>();
        myResourceProviderMock.setup((bar) => bar.getSelectedContent())
            .returns(() => [checkInInfoSpy, checkInInfoSpy]);
        const resourceProviderSpy: IResourceProvider = myResourceProviderMock.object;

        myBuildProviderMock = TypeMoq.Mock.ofType<IBuildProvider>();
        const buildProviderSpy: IBuildProvider = myBuildProviderMock.object;
        myRemoteBuildServerMock = tsMockito.mock(RemoteBuildServer);
        when(myRemoteBuildServerMock.getSuitableConfigurations(anything()))
            .thenReturn(Promise.resolve(["anyData"]));
        const remoteBuildServerSpy: RemoteBuildServer = tsMockito.instance(myRemoteBuildServerMock);

        const xmlParserMock: XmlParser = tsMockito.mock(XmlParser);
        when(xmlParserMock.parseProjectsWithRelatedBuilds(anything(), anything()))
            .thenReturn(Promise.resolve([new Project("pId", "pParentId", "pName")]));
        const xmlParserSpy: XmlParser = tsMockito.instance(xmlParserMock);
        myMessageManagerMock = mock(MessageManager);
        const messageManagerSpy = tsMockito.instance(myMessageManagerMock);
        myContextMock = TypeMoq.Mock.ofType<Context>();
        const contextSpy: Context = myContextMock.object;
        const windowsProxy = mock(WindowProxy);
        const windowSpy = tsMockito.instance(windowsProxy);
        myTestableCommand = new GetSuitableConfigs(
            providerProxySpy,
            resourceProviderSpy,
            buildProviderSpy,
            remoteBuildServerSpy,
            xmlParserSpy,
            messageManagerSpy,
            contextSpy,
            windowSpy);
    }

    test("should verify no files selected", (done) => {
        preSetUp();

        myResourceProviderMock.reset();
        myResourceProviderMock.setup((bar) => bar.getSelectedContent()).returns(() => []);

        myTestableCommand.exec().then(() => {
            done("An exception was expected");
        }).catch(() => {
            done();
        });
    });

    test("should verify no suitable build configs + without git", (done) => {
        preSetUp();

        when(myRemoteBuildServerMock.getSuitableConfigurations(anything())).thenReturn(Promise.resolve([]));
        when(myProviderProxyMock.hasGitProvider()).thenReturn(false);

        myTestableCommand.exec().then(() => {
            done("An exception was expected");
        }).catch(() => {
            verify(myMessageManagerMock.showErrorMessage(anything(), anything())).never();
            done();
        });
    });

    test("should verify no suitable build configs + git", (done) => {
        preSetUp();

        when(myRemoteBuildServerMock.getSuitableConfigurations(anything())).thenReturn(Promise.resolve([]));
        when(myProviderProxyMock.hasGitProvider()).thenReturn(true);

        myTestableCommand.exec().then((result: boolean) => {
            verify(myMessageManagerMock.showErrorMessage(anything(), anything())).once();
            assert.equal(result, false);
            done();
        }).catch(() => {
            done("An exception was not expected");
        });
    });

    test("should verify has suitable build configs + git", (done) => {
        preSetUp();

        when(myRemoteBuildServerMock.getSuitableConfigurations(anything()))
            .thenReturn(Promise.resolve(["any data"]));
        when(myProviderProxyMock.hasGitProvider()).thenReturn(true);

        myTestableCommand.exec().then((result: boolean) => {
            verify(myMessageManagerMock.showErrorMessage(anything(), anything())).never();
            assert.notEqual(result, false);
            verify(myProviderProxyMock.getGitBranch()).once();

            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify general calls", function (done) {
        preSetUp();

        myTestableCommand.exec().then(() => {
            myResourceProviderMock.verify((bar) => bar.getSelectedContent(), TypeMoq.Times.atLeastOnce());
            verify(myRemoteBuildServerMock.getSuitableConfigurations(anything())).called();
            myBuildProviderMock.verify((foo) => foo.setContent(TypeMoq.It.isAny()), TypeMoq.Times.atLeastOnce());
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });
});
