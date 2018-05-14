import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });

import {anyString, anything, instance, mock, verify, when} from "ts-mockito";
import {GitStatusCommand} from "../../../src/dal/git/GitStatusCommand";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import {GitStatusRowsParser} from "../../../src/dal/git/GitStatusRowsParser";
import * as assert from "assert";

suite("GitStatusCommand", () => {
    const workSpaceRootPath = "myWorkSpaceRootPath";
    const gitPath = "myGitPath";
    const isPorcelain = false;
    const cpMock: CpProxy = mock(CpProxy);
    const cpSpy: CpProxy = instance(cpMock);
    const gitStatusRowsParserMock: GitStatusRowsParser = mock(GitStatusRowsParser);
    const gitStatusRowsParserSpy: GitStatusRowsParser = instance(gitStatusRowsParserMock);

    test("should verify status returns none rows", function (done) {
        const command = new GitStatusCommand(workSpaceRootPath, gitPath, isPorcelain, cpSpy, gitStatusRowsParserSpy);
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({}));
        command.execute().then((results) => {
            verify(cpMock.execAsync(anyString())).called();
            verify(gitStatusRowsParserMock.tryParseRows(anyString(), anything())).never();
            assert.deepEqual(results, []);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify status returns some rows", function (done) {
        const command = new GitStatusCommand(workSpaceRootPath, gitPath, isPorcelain, cpSpy, gitStatusRowsParserSpy);
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({stdout: "any rows"}));
        command.execute().then((results) => {
            verify(cpMock.execAsync(anyString())).called();
            verify(gitStatusRowsParserMock.tryParseRows(anyString(), anything())).called();
            assert.notDeepEqual(results, []);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
