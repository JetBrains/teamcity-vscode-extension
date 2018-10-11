import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });

import {anyString, instance, mock, verify, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import * as assert from "assert";
import {GetLocalBranchNameCommand} from "../../../src/dal/git/GetLocalBranchNameCommand";

suite("GetLocalBranchNameCommand", () => {
    const workSpaceRootPath = "myWorkSpaceRootPath";
    const gitPath = "myGitPath";
    let cpMock: CpProxy;
    let cpSpy: CpProxy;

    test("should verify command returns nothing", function (done) {
        reinitMocks();
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({}));

        const command = new GetLocalBranchNameCommand(workSpaceRootPath, gitPath, cpSpy);

        command.execute().then(() => {
            done("expect an error");
        }).catch(() => {
            verify(cpMock.execAsync(anyString())).called();
            done();
        });
    });

    test("should verify command returns some value", function (done) {
        reinitMocks();
        const theResult: string = "anyBranchName";
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({stdout: theResult}));

        const command = new GetLocalBranchNameCommand(workSpaceRootPath, gitPath, cpSpy);

        command.execute().then((results) => {
            verify(cpMock.execAsync(anyString())).called();
            assert.equal(results, theResult);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify we trim the result output", function (done) {
        reinitMocks();
        const theResult: string = "anyBranchName";
        const theInput: string = `${theResult}    \n\n   \n`;
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({stdout: theInput}));

        const command = new GetLocalBranchNameCommand(workSpaceRootPath, gitPath, cpSpy);

        command.execute().then((results) => {
            verify(cpMock.execAsync(anyString())).called();
            assert.equal(results, theResult);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    function reinitMocks() {
        cpMock = mock(CpProxy);
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({stdout: "anyBranchName"}));
        cpSpy = instance(cpMock);
    }
});
