import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });

import {anyString, instance, mock, when} from "ts-mockito";
import {GetFirstMonthRev} from "../../../src/dal/git/GetFirstMonthRev";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import * as assert from "assert";

suite("GetFirstMonthRev", () => {
    const workSpaceRootPath = "myWorkSpaceRootPath";
    const gitPath = "myGitPath";
    let cpMock: CpProxy;
    let cpSpy: CpProxy;
    let theCommand: GetFirstMonthRev;

    function reinitMocks() {
        cpMock = mock(CpProxy);
        cpSpy = instance(cpMock);
        theCommand = new GetFirstMonthRev(workSpaceRootPath, gitPath, cpSpy);
    }

    test("should verify simple example", function (done) {
        reinitMocks();
        const testResult = {stdout: "7fedeef81835e6ba6388d68ecbe31ece16437402", stderr: ""};
        const expectedRev = "7fedeef81835e6ba6388d68ecbe31ece16437402";

        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve(testResult));

        theCommand.execute().then((result: string) => {
            assert.equal(result, expectedRev);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
