import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", {});

import {instance, mock} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import * as assert from "assert";
import {GitCommandsFactory} from "../../../src/dal/git/GitCommandsFactory";
import {GetLocalBranchNameCommand} from "../../../src/dal/git/GetLocalBranchNameCommand";
import {GetRepoBranchNameCommand} from "../../../src/dal/git/GetRepoBranchNameCommand";
import {GetRemoteNameCommand} from "../../../src/dal/git/GetRemoteNameCommand";
import {SettingsImpl} from "../../../src/bll/entities/settingsimpl";

suite("GitCommandFactory", () => {
    const workSpaceRootPath = "myWorkSpaceRootPath";
    const gitPath = "myGitPath";
    const cpMock: CpProxy = mock(CpProxy);
    const cpSpy: CpProxy = instance(cpMock);
    const settingsMock: SettingsImpl = mock(SettingsImpl);
    const settingsSpy: SettingsImpl = instance(settingsMock);

    test("should verify GetLocalBranchNameCommand command creation", function () {
        const factory = GitCommandsFactory.getInstance(cpSpy, settingsSpy, workSpaceRootPath, gitPath);
        const factoryGetLocalBranchNameCommand = factory.getLocalBranchNameCommand();
        const newGetLocalBranchNameCommand = new GetLocalBranchNameCommand(workSpaceRootPath, gitPath, cpSpy);
        assert.deepEqual(factoryGetLocalBranchNameCommand, newGetLocalBranchNameCommand);
    });

    test("should verify GetRepoBranchNameCommand command creation", function () {
        const factory = GitCommandsFactory.getInstance(cpSpy, settingsSpy, workSpaceRootPath, gitPath);
        const factoryGetRepoBranchNameCommand = factory.getRepoBranchNameCommand();
        const getLocalBranchNameCommand = new GetLocalBranchNameCommand(workSpaceRootPath, gitPath, cpSpy);
        const getRemoteNameCommand =
            new GetRemoteNameCommand(workSpaceRootPath, gitPath, cpSpy, getLocalBranchNameCommand);
        const newGetRepoBranchNameCommand =
            new GetRepoBranchNameCommand(workSpaceRootPath, gitPath, cpSpy, getRemoteNameCommand);
        assert.deepEqual(factoryGetRepoBranchNameCommand, newGetRepoBranchNameCommand);
    });
});
