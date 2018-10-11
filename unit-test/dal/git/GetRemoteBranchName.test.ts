import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });

import {anyString, instance, mock, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import * as assert from "assert";
import {GetRemoteBranchName} from "../../../src/dal/git/GetRemoteBranchName";

suite("GetRemoteBranchName", () => {
    const workSpaceRootPath = "myWorkSpaceRootPath";
    const gitPath = "myGitPath";
    let cpMock: CpProxy;
    let cpSpy: CpProxy;
    let theCommand: GetRemoteBranchName;

    function reinitMocks() {
        cpMock = mock(CpProxy);
        cpSpy = instance(cpMock);
        theCommand = new GetRemoteBranchName(workSpaceRootPath, gitPath, cpSpy);
    }

    test("should verify simple example", function (done) {
        reinitMocks();
        const testResult = {stdout: "ss/123/gg-test", stderr: ""};
        const expectedBranchName = "ss/123/gg-test";

        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve(testResult));

        theCommand.execute().then((result: string) => {
            assert.equal(result, expectedBranchName);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
