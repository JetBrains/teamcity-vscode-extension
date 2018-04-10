import {assert} from "chai";
import {Socket} from "net";
import {HttpHostRequest} from "../../src/bll/weblinklistener/httphostrequest";
import {WorkspaceProxy} from "../../src/bll/moduleproxies/workspace-proxy";
import {UriProxy} from "../../src/bll/moduleproxies/uri-proxy";
import {WindowProxy} from "../../src/bll/moduleproxies/window-proxy";
import {FsProxy} from "../../src/bll/moduleproxies/fs-proxy";
import {WebLinkListener} from "../../src/dal/weblinklistener";
import {anything, instance, mock, when} from "ts-mockito";
import {Uri, WorkspaceFolder} from "vscode";
import * as TypeMoq from "typemoq";

suite("WebLinkListener", () => {
    test("should verify sending incorrect request", async function () {
        const incorrectRequest = "Hello, server! Love, Client.";
        const server = setupServer();
        const SOCKET_NUMBER_START: number = 63330;
        const SOCKET_NUMBER_END: number = SOCKET_NUMBER_START + 9;
        let receivedCorrectResponse: boolean = false;
        for (let port = SOCKET_NUMBER_START; port <= SOCKET_NUMBER_END; port++) {
            if (await sendSocketRequest(port, incorrectRequest)) {
                receivedCorrectResponse = true;
                break;
            }
        }
        server.dispose();

        if (!receivedCorrectResponse) {
            throw new Error("We don't received correct response from VSCode.");
        }
    });

    test("should verify sending correct request", async function () {
        const incorrectRequest = "Hello, server! HTTP/1.1 Client.";
        const correctRequest = "GET /file?file=1.ts&project=&noCache=1523307618951&server=" +
            "http://localhost:8111/bs HTTP/1.1\n" +
            "logger.js:24\n" +
            "Host: 127.0.0.1:63331\n" +
            "Connection: keep-alive\n";
        const server = setupServer();

        const SOCKET_NUMBER_START: number = 63330;
        const SOCKET_NUMBER_END: number = SOCKET_NUMBER_START + 9;
        let receivedCorrectResponse: boolean = false;
        let incorrectData: Buffer;
        let correctData: Buffer;
        for (let port = SOCKET_NUMBER_START; port <= SOCKET_NUMBER_END; port++) {
            incorrectData = await sendSocketRequest(port, incorrectRequest);
            if (incorrectData) {
                break;
            }
        }
        for (let port = SOCKET_NUMBER_START; port <= SOCKET_NUMBER_END; port++) {
            correctData = await sendSocketRequest(port, correctRequest);
            if (correctData && !areBuffersEqual(correctData, incorrectData)) {
                break;
            }
        }
        if (incorrectData && correctData && !areBuffersEqual(correctData, incorrectData)) {
            receivedCorrectResponse = true;
        }

        server.dispose();
        if (!receivedCorrectResponse) {
            throw new Error("We haven't received correct response from VSCode.");
        }
    });
});

async function sendSocketRequest(port: number, request: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve) => {
        const client = new Socket();
        client.connect(port, "127.0.0.1", function() {
            console.log("Connected on port#" + port);
            client.write(request);
        });

        client.on("data", function(data) {
            const dataAsString = data.toString();
            if (dataAsString.toLowerCase().indexOf("visual studio code") !== -1) {
                client.destroy();
                console.log("Received data from vscode: " + data);
                resolve(data);
            } else {
                client.destroy();
                resolve(undefined);
            }
        });

        client.on("end", function() {
            console.log("Close port#" + port);
            resolve(undefined);
        });

        client.on("error", function() {
            console.log("Could not connected on port#" + port);
            client.destroy();
            resolve(undefined);
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
