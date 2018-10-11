import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", {});

import {anyString, instance, mock, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import {GetTfsWorkFoldInfo} from "../../../src/dal/tfs/GetTfsWorkFoldInfo";
import {ITfsWorkFoldInfo} from "../../../src/dal/tfs/ITfsWorkFoldInfo";
import {deepEqual, equal} from "assert";

suite("GetTfsWorkFoldInfo", () => {
    const tfWorkFoldResultExample: { stdout: string } = {
        stdout: "===============================================================================\n" +
            "Workspace : UNIT-239 (rugpanov)\n" +
            "Collection: https://someproject.visualstudio.com/\n" +
            " $/MyFirstProject/App1/App1: C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1\n"
    };
    const testTfInfo: ITfsWorkFoldInfo = {
        repositoryUrl: "https://someproject.visualstudio.com/",
        collectionName: "someproject",
        projectRemotePath: "$/MyFirstProject/App1/App1",
        projectLocalPath: "C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1"
    };
    const tfWorkFoldBadUrl: { stdout: string } = {
        stdout: "===============================================================================\n" +
            "Workspace : UNIT-239 (rugpanov)\n" +
            "Collection: sdasd/someproject.visualstudio/\n" +
            " $/MyFirstProject/App1/App1: C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1\n"
    };

    const testWorkspaceRP: string = "testWorkspaceRoot/Path";
    const testTfPath: string = "testTf/Path";

    let cpMock: CpProxy;
    let cpSpy: CpProxy;
    let theCommand: GetTfsWorkFoldInfo;

    function initMocks() {
        cpMock = mock(CpProxy);
        cpSpy = instance(cpMock);
        theCommand = new GetTfsWorkFoldInfo(testWorkspaceRP, testTfPath, cpSpy);
    }

    test("should verify good pattern", function (done) {
        initMocks();
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve(tfWorkFoldResultExample));
        theCommand.execute().then((result: ITfsWorkFoldInfo) => {
            deepEqual(result, testTfInfo);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify bad pattern", function (done) {
        initMocks();
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve("any example"));
        theCommand.execute().then((result: ITfsWorkFoldInfo) => {
            equal(result, undefined);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify bad pattern", function (done) {
        initMocks();
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve(tfWorkFoldBadUrl));
        theCommand.execute().then((result: ITfsWorkFoldInfo) => {
            equal(result, undefined);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
