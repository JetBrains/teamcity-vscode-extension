import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", {});

import {instance, mock} from "ts-mockito";
import {GitStatusCommand} from "../../../src/dal/git/GitStatusCommand";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import {GitStatusRowsParser} from "../../../src/dal/git/GitStatusRowsParser";
import * as assert from "assert";
import {GitCommandsFactory} from "../../../src/dal/git/GitCommandsFactory";
import {GetLocalBranchNameCommand} from "../../../src/dal/git/GetLocalBranchNameCommand";
import {GetRepoBranchNameCommand} from "../../../src/dal/git/GetRepoBranchNameCommand";
import {GetRemoteNameCommand} from "../../../src/dal/git/GetRemoteNameCommand";

suite("GitCommandFactory", () => {
    const workSpaceRootPath = "myWorkSpaceRootPath";
    const gitPath = "myGitPath";
    const isPorcelain = false;
    const cpMock: CpProxy = mock(CpProxy);
    const cpSpy: CpProxy = instance(cpMock);
    const gitStatusRowsParserMock: GitStatusRowsParser = mock(GitStatusRowsParser);
    const gitStatusRowsParserSpy: GitStatusRowsParser = instance(gitStatusRowsParserMock);

    test("should verify GitStatusCommand creation", function () {
        const factory = new GitCommandsFactory(cpSpy, gitStatusRowsParserSpy);
        const createdStatusCommand = factory.getStatusCommand(workSpaceRootPath, gitPath, isPorcelain);
        const newStatusCommand = new GitStatusCommand(workSpaceRootPath,
            gitPath,
            isPorcelain,
            cpSpy,
            gitStatusRowsParserSpy);
        assert.deepEqual(createdStatusCommand, newStatusCommand);
    });

    test("should verify GetLocalBranchNameCommand command creation", function () {
        const factory = new GitCommandsFactory(cpSpy, gitStatusRowsParserSpy);
        const factoryGetLocalBranchNameCommand = factory.getLocalBranchNameCommand(workSpaceRootPath, gitPath);
        const newGetLocalBranchNameCommand = new GetLocalBranchNameCommand(workSpaceRootPath, gitPath, cpSpy);
        assert.deepEqual(factoryGetLocalBranchNameCommand, newGetLocalBranchNameCommand);
    });

    test("should verify GetRepoBranchNameCommand command creation", function () {
        const factory = new GitCommandsFactory(cpSpy, gitStatusRowsParserSpy);
        const factoryGetRepoBranchNameCommand = factory.getRepoBranchNameCommand(workSpaceRootPath, gitPath);
        const getLocalBranchNameCommand = new GetLocalBranchNameCommand(workSpaceRootPath, gitPath, cpSpy);
        const getRemoteNameCommand =
            new GetRemoteNameCommand(workSpaceRootPath, gitPath, cpSpy, getLocalBranchNameCommand);
        const newGetRepoBranchNameCommand =
            new GetRepoBranchNameCommand(workSpaceRootPath, gitPath, cpSpy, getRemoteNameCommand);
        assert.deepEqual(factoryGetRepoBranchNameCommand, newGetRepoBranchNameCommand);
    });
});
