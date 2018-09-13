import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", {});

import {anyString, instance, mock, verify, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import {BriefDiffCommand} from "../../../src/dal/tfs/BriefDiffCommand";
import {BriefDiffRowsParser} from "../../../src/dal/tfs/BriefDiffRowsParser";

suite("BriefDiffCommand", () => {
    const testWorkspaceRoot: string = "workspaceRoot/Path";
    const testTfPath: string = "testTf/Path";
    let cpMock: CpProxy;
    let briefDiffRowsParserMock: BriefDiffRowsParser;
    let cpSpy: CpProxy;
    let theCommand: BriefDiffCommand;

    function initMocks() {
        cpMock = mock(CpProxy);
        briefDiffRowsParserMock = mock(BriefDiffRowsParser);
        cpSpy = instance(cpMock);
        theCommand = new BriefDiffCommand(testWorkspaceRoot, testTfPath, cpSpy, instance(briefDiffRowsParserMock));
    }

    test("should verify command success", function (done) {
        initMocks();

        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({stdout: "some objects"}));
        theCommand.execute().then(() => {
            verify(briefDiffRowsParserMock.tryParseRows(anyString())).called();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify command failed", function (done) {
        initMocks();

        when(cpMock.execAsync(anyString())).thenReturn(Promise.reject("any reason"));
        theCommand.execute().then(() => {
            done("shouldn't be called");
        }).catch(() => {
            verify(briefDiffRowsParserMock.tryParseRows(anyString())).never();
            done();
        });
    });

    test("should verify no lines returned", function (done) {
        initMocks();

        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve(""));
        theCommand.execute().then(() => {
            done("shouldn't be called");
        }).catch(() => {
            verify(briefDiffRowsParserMock.tryParseRows(anyString())).never();
            done();
        });
    });
});
