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
import {GetFirstMonthRev} from "../../../src/dal/git/GetFirstMonthRev";
import {GetLastCompatibleMergeBaseRev} from "../../../src/dal/git/GetLastCompatibleMergeBaseRev";
import {GetRemoteBranchName} from "../../../src/dal/git/GetRemoteBranchName";
import {GetStagedFileContentStream} from "../../../src/dal/git/GetStagedFileContentStream";
import {GetStagedFileContentLength} from "../../../src/dal/git/GetStagedFileContentLength";
import {CvsResource} from "../../../src/bll/entities/cvsresources/cvsresource";
import {AddedCvsResource} from "../../../src/bll/entities/cvsresources/addedcvsresource";

suite("GitCommandFactory", () => {
    const workSpaceRootPath = "myWorkSpaceRootPath";
    const gitPath = "myGitPath";
    const cpMock: CpProxy = mock(CpProxy);
    const cpSpy: CpProxy = instance(cpMock);
    const settingsMock: SettingsImpl = mock(SettingsImpl);
    const settingsSpy: SettingsImpl = instance(settingsMock);

    test("should verify getFirstMonthRevCommand command creation", () => {
        const factory = GitCommandsFactory.getInstance(cpSpy, settingsSpy, workSpaceRootPath, gitPath);
        const factoryGetFirstMonthRev = factory.getFirstMonthRevCommand();
        const newGetFirstMonthRev = new GetFirstMonthRev(workSpaceRootPath, gitPath, cpSpy);
        assert.deepEqual(factoryGetFirstMonthRev, newGetFirstMonthRev);
    });

    test("should verify getRepoBranchNameCommand command creation", () => {
        const factory = GitCommandsFactory.getInstance(cpSpy, settingsSpy, workSpaceRootPath, gitPath);
        const factoryGetRepoBranchNameCommand = factory.getRepoBranchNameCommand();

        const newGetLocalBranchNameCommand = new GetLocalBranchNameCommand(workSpaceRootPath, gitPath, cpSpy);
        const newGetRemoteNameCommand =
            new GetRemoteNameCommand(workSpaceRootPath, gitPath, cpSpy, newGetLocalBranchNameCommand);
        const newGetRepoBranchNameCommand
            = new GetRepoBranchNameCommand(workSpaceRootPath, gitPath, cpSpy, newGetRemoteNameCommand);
        assert.deepEqual(factoryGetRepoBranchNameCommand, newGetRepoBranchNameCommand);
    });

    test("should verify getLastCompatibleMergeBaseRevCommand command creation", () => {
        const factory = GitCommandsFactory.getInstance(cpSpy, settingsSpy, workSpaceRootPath, gitPath);
        const factoryGetLastCompatibleMergeBaseRev: GetLastCompatibleMergeBaseRev =
            factory.getLastCompatibleMergeBaseRevCommand();

        const newGetRemoteBranchName: GetRemoteBranchName = new GetRemoteBranchName(workSpaceRootPath, gitPath, cpSpy);
        const newGetLastCompatibleMergeBaseRev: GetLastCompatibleMergeBaseRev
            = new GetLastCompatibleMergeBaseRev(workSpaceRootPath, gitPath, cpSpy, newGetRemoteBranchName);
        assert.deepEqual(factoryGetLastCompatibleMergeBaseRev, newGetLastCompatibleMergeBaseRev);
    });

    test("should verify getStagedFileContentStreamCommand command creation", () => {
        const testedResource: CvsResource = new AddedCvsResource("test", "test", "test");
        const factory = GitCommandsFactory.getInstance(cpSpy, settingsSpy, workSpaceRootPath, gitPath);

        const factoryGetLastCompatibleMergeBaseRev: GetStagedFileContentStream =
            factory.getStagedFileContentStreamCommand(testedResource);

        const newGetStagedFileContentLength: GetStagedFileContentLength =
            new GetStagedFileContentLength(workSpaceRootPath, gitPath, testedResource, cpSpy);
        const newGetLastCompatibleMergeBaseRev: GetStagedFileContentStream
            = new GetStagedFileContentStream(workSpaceRootPath,
            gitPath,
            cpSpy,
            testedResource,
            newGetStagedFileContentLength);
        assert.deepEqual(factoryGetLastCompatibleMergeBaseRev, newGetLastCompatibleMergeBaseRev);
    });
});
