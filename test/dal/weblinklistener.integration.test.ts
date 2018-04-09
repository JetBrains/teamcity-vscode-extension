import {assert} from "chai";
import {Socket} from "net";
import {HttpHostRequest} from "../../src/bll/weblinklistener/httphostrequest";
import {WorkspaceProxy} from "../../src/bll/moduleproxies/workspace-proxy";
import {UriProxy} from "../../src/bll/moduleproxies/uri-proxy";
import {WindowProxy} from "../../src/bll/moduleproxies/window-proxy";
import {FsProxy} from "../../src/bll/moduleproxies/fs-proxy";
import {WebLinkListener} from "../../src/dal/weblinklistener";
import {anyString, anything, instance, mock, when} from "ts-mockito";
import { VsCodeUtils } from "../../src/bll/utils/vscodeutils";
import { Utils } from "../../src/bll/utils/utils";

suite("WebLinkListener", () => {
    test("should verify sending incorrect request", async function () {
        const incorrectRequest = "Hello, server! Love, Client.";
        setupServer();
        const SOCKET_NUMBER_START: number = 63330;
        const SOCKET_NUMBER_END: number = SOCKET_NUMBER_START + 9;
        let receivedCorrectResponse: boolean = false;
        for (let port = SOCKET_NUMBER_START; port <= SOCKET_NUMBER_END; port++) {
            if (await sendSocketRequest(port, incorrectRequest)) {
                receivedCorrectResponse = true;
                break;
            }
        }
        if (!receivedCorrectResponse) {
            throw new Error("We don't received correct response from VSCode.");
        }
    });

    test("should verify sending correct request", async function () {
        const incorrectRequest = "Hello, server! Love, Client.";
        const correctRequest = "GET /file?file=1.ts&project=&noCache=1523307618951&server=http://localhost:8111/bs HTTP/1.1\n" +
            "logger.js:24\n" +
            "Host: 127.0.0.1:63331\n" +
            "Connection: keep-alive\n";
        setupServer();

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
            if (correctData) {
                break;
            }
        }
        if (incorrectData && correctData && !areBuffersEqual(correctData, incorrectData)) {
            receivedCorrectResponse = true;
        }

        if (!receivedCorrectResponse) {
            throw new Error("We don't received correct response from VSCode.");
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
            console.log("Received: " + data);
            const dataAsString = data.toString();
            if (dataAsString.toLowerCase().indexOf("visual studio code") !== -1) {
                client.destroy();
                resolve(data);
            } else {
                client.destroy();
                resolve(undefined);
            }
        });

        client.on("end", function(data) {
            console.log("Close port#" + port);
            resolve(undefined);
        });

        client.on("error", function(data) {
            console.log("Could not connected on port#" + port);
            client.destroy();
            resolve(undefined);
        });
    });
}

function setupServer(): void {
    const fsProxyMock = mock(FsProxy);
    when(fsProxyMock.existsAsync(anything())).thenReturn(Promise.resolve(true));
    const fsProxySpy = instance(fsProxyMock);
    const windowProxy = mock(WindowProxy);
    when(windowProxy.showTextDocument(anything())).thenReturn(Promise.resolve(undefined));
    const windowSpy = instance(windowProxy);
    const workspaceProxy = mock(WorkspaceProxy);
    when(workspaceProxy.getWorkspaceFolders()).thenReturn([]);
    const workspaceSpy = instance(workspaceProxy);
    const httpHostRequest: HttpHostRequest = new HttpHostRequest(workspaceSpy, fsProxySpy, new UriProxy(), windowSpy);
    const webLinkListener: WebLinkListener = new WebLinkListener(httpHostRequest);
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
