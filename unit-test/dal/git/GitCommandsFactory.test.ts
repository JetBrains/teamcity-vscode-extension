import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });

import {instance, mock} from "ts-mockito";
import {GitStatusCommand} from "../../../src/dal/git/GitStatusCommand";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import {GitStatusRowsParser} from "../../../src/dal/git/GitStatusRowsParser";
import * as assert from "assert";
import {GitCommandsFactory} from "../../../src/dal/git/GitCommandsFactory";

suite("GitCommandFactory", () => {
    const workSpaceRootPath = "myWorkSpaceRootPath";
    const gitPath = "myGitPath";
    const isPorcelain = false;
    const cpMock: CpProxy = mock(CpProxy);
    const cpSpy: CpProxy = instance(cpMock);
    const gitStatusRowsParserMock: GitStatusRowsParser = mock(GitStatusRowsParser);
    const gitStatusRowsParserSpy: GitStatusRowsParser = instance(gitStatusRowsParserMock);

    test("should verify status command creation", function () {
        const factory = new GitCommandsFactory(cpSpy, gitStatusRowsParserSpy);
        const createdStatusCommand = factory.getStatusCommand(workSpaceRootPath, gitPath, isPorcelain);
        const newStatusCommand = new GitStatusCommand(workSpaceRootPath,
                                                      gitPath,
                                                      isPorcelain,
                                                      cpSpy,
                                                      gitStatusRowsParserSpy);
        assert.deepEqual(createdStatusCommand, newStatusCommand);
    });
});
