import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });

import {anyString, instance, mock, verify, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import * as assert from "assert";
import {GetRemoteNameCommand} from "../../../src/dal/git/GetRemoteNameCommand";
import {GetRepoBranchNameCommand} from "../../../src/dal/git/GetRepoBranchNameCommand";

suite("GetRepoBranchNameCommand", () => {
    const workSpaceRootPath = "myWorkSpaceRootPath";
    const gitPath = "myGitPath";
    let cpMock: CpProxy;
    let cpSpy: CpProxy;

    let getRemoteNameCommandMock: GetRemoteNameCommand;
    let getRemoteNameCommandSpy: GetRemoteNameCommand;

    test("should verify getRemoteNameCommand returns error", function (done) {
        reinitMocks();
        when(getRemoteNameCommandMock.execute()).thenReturn(Promise.reject("any error"));

        const command = new GetRepoBranchNameCommand(workSpaceRootPath, gitPath, cpSpy, getRemoteNameCommandSpy);

        command.execute().then(() => {
            done("expect an error");
        }).catch(() => {
            verify(getRemoteNameCommandMock.execute()).called();
            verify(cpMock.execAsync(anyString())).never();
            done();
        });
    });

    test("should verify getRemoteNameCommand returns any value", function (done) {
        reinitMocks();
        when(getRemoteNameCommandMock.execute()).thenReturn(Promise.resolve("repoName"));

        const command = new GetRepoBranchNameCommand(workSpaceRootPath, gitPath, cpSpy, getRemoteNameCommandSpy);

        command.execute().then(() => {
            verify(getRemoteNameCommandMock.execute()).called();
            verify(cpMock.execAsync(anyString())).called();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify command returns nothing", function (done) {
        reinitMocks();
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({stdout: ""}));

        const command = new GetRepoBranchNameCommand(workSpaceRootPath, gitPath, cpSpy, getRemoteNameCommandSpy);

        command.execute().then(() => {
            done("expect an error");
        }).catch(() => {
            verify(getRemoteNameCommandMock.execute()).called();
            verify(cpMock.execAsync(anyString())).called();
            done();
        });
    });

    test("should verify command returns any value", function (done) {
        reinitMocks();
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({stdout: "anyRepoBranchName"}));

        const command = new GetRepoBranchNameCommand(workSpaceRootPath, gitPath, cpSpy, getRemoteNameCommandSpy);

        command.execute().then((results) => {
            verify(getRemoteNameCommandMock.execute()).called();
            verify(cpMock.execAsync(anyString())).called();
            assert.notEqual(results, undefined);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify command remove remote prefix", function (done) {
        reinitMocks();
        const remoteName: string = "any/remote";
        const repoBranchName: string = "branch/name";
        const commandOutput: string = `${remoteName}/${repoBranchName}`;
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({stdout: `${commandOutput}`}));
        when(getRemoteNameCommandMock.execute()).thenReturn(Promise.resolve(remoteName));

        const command = new GetRepoBranchNameCommand(workSpaceRootPath, gitPath, cpSpy, getRemoteNameCommandSpy);

        command.execute().then((results) => {
            verify(getRemoteNameCommandMock.execute()).called();
            verify(cpMock.execAsync(anyString())).called();
            assert.equal(results, repoBranchName);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify we trim the result output", function (done) {
        reinitMocks();
        const remoteName: string = "any/remote";
        const repoBranchName: string = "branch/name";
        const commandOutput: string = `${remoteName}/${repoBranchName}       \n\n    \n`;
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({stdout: `${commandOutput}`}));
        when(getRemoteNameCommandMock.execute()).thenReturn(Promise.resolve(remoteName));

        const command = new GetRepoBranchNameCommand(workSpaceRootPath, gitPath, cpSpy, getRemoteNameCommandSpy);

        command.execute().then((results) => {
            verify(getRemoteNameCommandMock.execute()).called();
            verify(cpMock.execAsync(anyString())).called();
            assert.equal(results, repoBranchName);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    function reinitMocks() {
        cpMock = mock(CpProxy);
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve({stdout: "repoBranchName"}));
        cpSpy = instance(cpMock);

        getRemoteNameCommandMock = mock(GetRemoteNameCommand);
        when(getRemoteNameCommandMock.execute()).thenReturn(Promise.resolve("remoteName"));
        getRemoteNameCommandSpy = instance(getRemoteNameCommandMock);
    }
});
