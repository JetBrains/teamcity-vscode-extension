import "reflect-metadata";

const rmock = require("mock-require");
rmock("vscode", { });
import {anything, instance, mock, when} from "ts-mockito";
import {WindowProxy} from "../../../src/bll/moduleproxies/window-proxy";
import {HttpHostRequest} from "../../../src/bll/weblinklistener/httphostrequest";
import {FsProxy} from "../../../src/bll/moduleproxies/fs-proxy";
import {UriProxy} from "../../../src/bll/moduleproxies/uri-proxy";
import {WorkspaceProxy} from "../../../src/bll/moduleproxies/workspace-proxy";
import * as assert from "assert";
import {Uri, WorkspaceFolder} from "vscode";
import * as TypeMoq from "typemoq";

suite("HttpHostRequest", function () {

    test("should verify processRequest with incorrect number of tokens", async function () {
        const fsProxyMock = mock(FsProxy);
        when(fsProxyMock.existsAsync(anything())).thenReturn(Promise.resolve(true));
        const fsProxySpy = instance(fsProxyMock);
        const windowProxy = mock(WindowProxy);
        when(windowProxy.showTextDocument(anything())).thenReturn(Promise.resolve(undefined));
        const windowSpy = instance(windowProxy);
        const workspaceProxy = mock(WorkspaceProxy);
        when(workspaceProxy.getWorkspaceFolders()).thenReturn([]);
        const workspaceSpy = instance(workspaceProxy);
        const httpHostRequest: HttpHostRequest = new HttpHostRequest(workspaceSpy, fsProxySpy,
                                                                     new UriProxy(), windowSpy);
        {
            const request = "1\n";
            const {succeed, httpVersion} = await httpHostRequest.processRequest(new Buffer(request));
            assert.equal(succeed, false);
            assert.equal(httpVersion, undefined);
        }

        {
            const request = "1 2\n";
            const {succeed, httpVersion} = await httpHostRequest.processRequest(new Buffer(request));
            assert.equal(succeed, false);
            assert.equal(httpVersion, undefined);
        }
    });

    test("should verify processRequest without endOfPath", async function () {
        const fsProxyMock = mock(FsProxy);
        when(fsProxyMock.existsAsync(anything())).thenReturn(Promise.resolve(true));
        const fsProxySpy = instance(fsProxyMock);
        const windowProxy = mock(WindowProxy);
        when(windowProxy.showTextDocument(anything())).thenReturn(Promise.resolve(undefined));
        const windowSpy = instance(windowProxy);
        const workspaceProxy = mock(WorkspaceProxy);
        when(workspaceProxy.getWorkspaceFolders()).thenReturn([]);
        const workspaceSpy = instance(workspaceProxy);
        const httpHostRequest: HttpHostRequest = new HttpHostRequest(workspaceSpy, fsProxySpy,
                                                                     new UriProxy(), windowSpy);
        {
            const request = "1 2 httpVersion\n";
            const {succeed, httpVersion} = await httpHostRequest.processRequest(new Buffer(request));
            assert.equal(succeed, false);
            assert.equal(httpVersion, "httpVersion");
        }
    });

    test("should verify processRequest with supported args", async function () {
        const fsProxyMock = mock(FsProxy);
        when(fsProxyMock.existsAsync(anything())).thenReturn(Promise.resolve(true));
        const fsProxySpy = instance(fsProxyMock);
        const windowProxy = mock(WindowProxy);
        when(windowProxy.showTextDocument(anything())).thenReturn(Promise.resolve(undefined));
        const windowSpy = instance(windowProxy);

        const uriMock: TypeMoq.IMock<Uri> = TypeMoq.Mock.ofType<Uri>();
        uriMock.setup((foo) => foo.path).returns(() => "path");
        uriMock.setup((foo) => foo.fsPath).returns(() => "fsPath");
        const uriSpy: Uri = uriMock.object;

        const workspaceFolderMock: TypeMoq.IMock<WorkspaceFolder> = TypeMoq.Mock.ofType<WorkspaceFolder>();
        workspaceFolderMock.setup((foo) => foo.uri).returns(() => uriSpy);
        const workspaceFolderSpy: WorkspaceFolder = workspaceFolderMock.object;

        const workspaceProxy = mock(WorkspaceProxy);
        when(workspaceProxy.getWorkspaceFolders()).thenReturn([workspaceFolderSpy]);
        const workspaceSpy = instance(workspaceProxy);

        const uriProxyMock = mock(UriProxy);
        when(uriProxyMock.file(anything())).thenReturn(uriSpy);
        const uriProxySpy = instance(uriProxyMock);

        const httpHostRequest: HttpHostRequest = new HttpHostRequest(workspaceSpy, fsProxySpy, uriProxySpy, windowSpy);
        {
            const request = "1 /file?file=1 httpVersion\n";
            const {succeed, httpVersion} = await httpHostRequest.processRequest(new Buffer(request));
            assert.equal(succeed, true);
            assert.equal(httpVersion, "httpVersion");
        }
    });

    test("should verify processRequest with unsupported args", async function () {
        const fsProxyMock = mock(FsProxy);
        when(fsProxyMock.existsAsync(anything())).thenReturn(Promise.resolve(true));
        const fsProxySpy = instance(fsProxyMock);
        const windowProxy = mock(WindowProxy);
        when(windowProxy.showTextDocument(anything())).thenReturn(Promise.resolve(undefined));
        const windowSpy = instance(windowProxy);

        const uriMock: TypeMoq.IMock<Uri> = TypeMoq.Mock.ofType<Uri>();
        uriMock.setup((foo) => foo.path).returns(() => "path");
        uriMock.setup((foo) => foo.fsPath).returns(() => "fsPath");
        const uriSpy: Uri = uriMock.object;

        const workspaceFolderMock: TypeMoq.IMock<WorkspaceFolder> = TypeMoq.Mock.ofType<WorkspaceFolder>();
        workspaceFolderMock.setup((foo) => foo.uri).returns(() => uriSpy);
        const workspaceFolderSpy: WorkspaceFolder = workspaceFolderMock.object;

        const workspaceProxy = mock(WorkspaceProxy);
        when(workspaceProxy.getWorkspaceFolders()).thenReturn([workspaceFolderSpy]);
        const workspaceSpy = instance(workspaceProxy);

        const uriProxyMock = mock(UriProxy);
        when(uriProxyMock.file(anything())).thenReturn(uriSpy);
        const uriProxySpy = instance(uriProxyMock);

        let httpHostRequest: HttpHostRequest = new HttpHostRequest(workspaceSpy, fsProxySpy, uriProxySpy, windowSpy);
        {
            const request = "1 /file?test=1 httpVersion\n";
            const {succeed, httpVersion} = await httpHostRequest.processRequest(new Buffer(request));
            assert.equal(succeed, false);
            assert.equal(httpVersion, "httpVersion");
        }

        httpHostRequest = new HttpHostRequest(workspaceSpy, fsProxySpy, uriProxySpy, windowSpy);
        {
            const request = "1 /patch?file=1 httpVersion\n";
            const {succeed, httpVersion} = await httpHostRequest.processRequest(new Buffer(request));
            assert.equal(succeed, false);
            assert.equal(httpVersion, "httpVersion");
        }

        httpHostRequest = new HttpHostRequest(workspaceSpy, fsProxySpy, uriProxySpy, windowSpy);
        {
            const request = "1 /test?file=1 httpVersion\n";
            const {succeed, httpVersion} = await httpHostRequest.processRequest(new Buffer(request));
            assert.equal(succeed, false);
            assert.equal(httpVersion, "httpVersion");
        }
    });
});
