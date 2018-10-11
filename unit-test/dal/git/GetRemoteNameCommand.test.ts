import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });

import {anyString, instance, mock, verify, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import * as assert from "assert";
import {GetLocalBranchNameCommand} from "../../../src/dal/git/GetLocalBranchNameCommand";
import {GetRemoteNameCommand} from "../../../src/dal/git/GetRemoteNameCommand";

suite("GetRemoteNameCommand", () => {
    const workSpaceRootPath = "myWorkSpaceRootPath";
    const gitPath = "myGitPath";
    let cpMock: CpProxy;
    let cpSpy: CpProxy;

    let getLocalBranchNameCommandMock: GetLocalBranchNameCommand;
    let getLocalBranchNameCommandSpy: GetLocalBranchNameCommand;

    test("should verify getLocalBranchNameCommand returns error", function (done) {
        reinitMocks();
        when(getLocalBranchNameCommandMock.execute()).thenReturn(Promise.reject("any error"));

        const command = new GetRemoteNameCommand(workSpaceRootPath, gitPath, cpSpy, getLocalBranchNameCommandSpy);

        command.execute().then(() => {
            done("expect an error");
        }).catch(() => {
            verify(getLocalBranchNameCommandMock.execute()).called();
            verify(cpMock.execAsync(anyString())).never();
            done();
        });
    });

    test("should verify getLocalBranchNameCommand returns any value", function (done) {
        reinitMocks();
        when(getLocalBranchNameCommandMock.execute()).thenReturn(Promise.resolve("localBranchName"));

        const command = new GetRemoteNameCommand(workSpaceRootPath, gitPath, cpSpy, getLocalBranchNameCommandSpy);

        command.execute().then(() => {
            verify(getLocalBranchNameCommandMock.execute()).called();
            verify(cpMock.execAsync(anyString())).called();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify command returns nothing", function (done) {
        reinitMocks();
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({stdout: ""}));

        const command = new GetRemoteNameCommand(workSpaceRootPath, gitPath, cpSpy, getLocalBranchNameCommandSpy);

        command.execute().then(() => {
            done("expect an error");
        }).catch(() => {
            verify(getLocalBranchNameCommandMock.execute()).called();
            verify(cpMock.execAsync(anyString())).called();
            done();
        });
    });

    test("should verify command returns any value", function (done) {
        reinitMocks();
        const expectedResult: string = "anyRemoteName";
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({stdout: expectedResult}));

        const command = new GetRemoteNameCommand(workSpaceRootPath, gitPath, cpSpy, getLocalBranchNameCommandSpy);

        command.execute().then((results) => {
            verify(getLocalBranchNameCommandMock.execute()).called();
            verify(cpMock.execAsync(anyString())).called();
            assert.equal(results, expectedResult);
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

        const command = new GetRemoteNameCommand(workSpaceRootPath, gitPath, cpSpy, getLocalBranchNameCommandSpy);

        command.execute().then((results) => {
            verify(getLocalBranchNameCommandMock.execute()).called();
            verify(cpMock.execAsync(anyString())).called();
            assert.equal(results, theResult);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    function reinitMocks() {
        cpMock = mock(CpProxy);
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({stdout: "remoteName"}));
        cpSpy = instance(cpMock);

        getLocalBranchNameCommandMock = mock(GetLocalBranchNameCommand);
        when(getLocalBranchNameCommandMock.execute()).thenReturn(Promise.resolve("localBranchName"));
        getLocalBranchNameCommandSpy = instance(getLocalBranchNameCommandMock);
    }
});
