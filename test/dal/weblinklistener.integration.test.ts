import {assert} from "chai";
import {HttpHostRequest} from "../../src/bll/weblinklistener/httphostrequest";
import {WorkspaceProxy} from "../../src/bll/moduleproxies/workspace-proxy";
import {UriProxy} from "../../src/bll/moduleproxies/uri-proxy";
import {WindowProxy} from "../../src/bll/moduleproxies/window-proxy";
import {FsProxy} from "../../src/bll/moduleproxies/fs-proxy";
import {WebLinkListener} from "../../src/dal/weblinklistener";
import {anything, instance, mock, when} from "ts-mockito";
import {Uri, WorkspaceFolder} from "vscode";
import * as TypeMoq from "typemoq";
import * as request from "request";

suite("WebLinkListener", () => {
    test("should verify sending incorrect request", async function () {
        const incorrectRequest = { smt:"test1" };
        const server = setupServer();
        const SOCKET_NUMBER_START: number = 63330;
        const SOCKET_NUMBER_END: number = SOCKET_NUMBER_START + 9;
        let receivedVSCodeResponse: boolean = false;
        for (let port = SOCKET_NUMBER_START; port <= SOCKET_NUMBER_END; port++) {
            const result = await sendSocketRequest(port, incorrectRequest);
            if (result !== undefined && result.toString() !== "") {
                receivedVSCodeResponse = true;
                break;
            }
        }
        server.dispose();

        if (!receivedVSCodeResponse) {
            throw new Error("We don't received correct response from VSCode.");
        }
    });

    test("should verify sending correct request", async function () {
        const incorrectRequest = { smt:"test1" };
        const correctRequest = { file: "1.ts", project: "", noCache: 1523307618951, server:"http://localhost:8111"};
        const server = setupServer();
        const SOCKET_NUMBER_START: number = 63330;
        const SOCKET_NUMBER_END: number = SOCKET_NUMBER_START + 9;
        let incorrectData: Buffer;
        let correctData: Buffer;
        for (let port = SOCKET_NUMBER_START; port <= SOCKET_NUMBER_END; port++) {
            const result = await sendSocketRequest(port, incorrectRequest);
            if (result !== undefined && result.toString() !== "") {
                incorrectData = result;
                break;
            }
        }
        for (let port = SOCKET_NUMBER_START; port <= SOCKET_NUMBER_END; port++) {
            const result = await sendSocketRequest(port, correctRequest);
            if (result !== undefined && result.toString() !== "" && !areBuffersEqual(result, incorrectData)) {
                correctData = result;
                break;
            }
        }
        server.dispose();
        if (!incorrectData || !correctData || areBuffersEqual(correctData, incorrectData)) {
            throw new Error("We haven't received correct response from VSCode");
        }
    });
});

async function sendSocketRequest(port: number, requestParam: {}): Promise<Buffer> {
    return new Promise<Buffer>((resolve) => {
        // tslint:disable-next-line:no-null-keyword
        const bufferBodyEncoding = null;
        request({url:`http://127.0.0.1:${port}/file`, qs:requestParam, encoding: bufferBodyEncoding}, (error, response, body) => {
            if (error !== null ||
                !response.headers["server"] ||
                response.headers["server"].indexOf("Visual Studio Code") === -1) {
                resolve(undefined);
            } else {
                resolve(body);
            }
        });
    });
}

function setupServer(): WebLinkListener {
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
    return new WebLinkListener(httpHostRequest);
}

function areBuffersEqual(bufA, bufB): boolean {
    const len = bufA.length;
    if (len !== bufB.length) {
        return false;
    }
    for (let i = 0; i < len; i++) {
        if (bufA.readUInt8(i) !== bufB.readUInt8(i)) {
            return false;
        }
    }
    return true;
}
