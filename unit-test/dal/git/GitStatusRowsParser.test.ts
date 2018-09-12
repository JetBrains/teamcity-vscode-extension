const rmock = require("mock-require");
rmock("vscode", {});

import "reflect-metadata";
import {GitCommandArgumentsParser} from "../../../src/dal/git/GitCommandArgumentsParser";
import {GitStatusRowsParser} from "../../../src/dal/git/GitStatusRowsParser";
import {CvsResource} from "../../../src/bll/entities/cvsresources/cvsresource";
import * as assert from "assert";
import {CvsFileStatusCode} from "../../../src/bll/utils/constants";
import {SettingsImpl} from "../../../src/bll/entities/settingsimpl";
import {instance, mock, when} from "ts-mockito";
import {Settings} from "../../../src/bll/entities/settings";
import {GetFirstMonthRev} from "../../../src/dal/git/GetFirstMonthRev";
import {GetLastCompatibleMergeBaseRev} from "../../../src/dal/git/GetLastCompatibleMergeBaseRev";

suite("GitCommandArgumentsParser", () => {

    const settingsMock: Settings = mock(SettingsImpl);
    const settingsSpy: Settings = instance(settingsMock);

    const getFirstMonthRevMock: GetFirstMonthRev = mock(GetFirstMonthRev);
    when(getFirstMonthRevMock.execute()).thenReturn(Promise.resolve("test_firstMonthRevHash"));
    const getFirstMonthRevSpy: GetFirstMonthRev = instance(getFirstMonthRevMock);

    const getLastCompatibleMergeBaseRevMock: GetLastCompatibleMergeBaseRev = mock(GetLastCompatibleMergeBaseRev);
    when(getFirstMonthRevMock.execute()).thenReturn(Promise.resolve("test lastRevHash"));
    const getLastCompatibleMergeBaseRevSpy: GetLastCompatibleMergeBaseRev = instance(getLastCompatibleMergeBaseRevMock);

    const workspaceRootPath = "workspaceRootPath";

    async function getParser() {
        return GitStatusRowsParser.prepareInstance(settingsSpy, getFirstMonthRevSpy, getLastCompatibleMergeBaseRevSpy);
    }

    test("should verify parsing of one correct row from index | changes from index", async () => {
        when(settingsMock.shouldCollectGitChangesFromIndex()).thenReturn(true);
        const statusRow = "A  path1/path2/path3/file1";

        const parser: GitStatusRowsParser = await getParser();
        const rows = parser.tryParseRows(workspaceRootPath, [statusRow]);
        assert.equal(rows.length, 1);
        assert.equal(rows[0].status, CvsFileStatusCode.ADDED);
        assert.equal(rows[0].fileName, "path1/path2/path3/file1");
    });

    test("should verify parsing of one incorrect row from index | changes from index", async () => {
        when(settingsMock.shouldCollectGitChangesFromIndex()).thenReturn(true);
        const statusRow = "U  path1/path2/path3/file1";

        const parser: GitStatusRowsParser = await getParser();
        const rows: CvsResource[] = parser.tryParseRows(workspaceRootPath, [statusRow]);

        assert.equal(rows.length, 0);
    });

    test("should verify parsing of two correct row from index | changes from index", async () => {
        when(settingsMock.shouldCollectGitChangesFromIndex()).thenReturn(true);
        const statusRow = "A  path1/path2/path3/file1";
        const statusRow2 = "R  path1/path2/path3/file1 -> path4/path5/path6/file2";

        const parser: GitStatusRowsParser = await getParser();
        const rows: CvsResource[] = parser.tryParseRows(workspaceRootPath, [statusRow, statusRow2]);

        assert.equal(rows.length, 2);
    });

    test("should verify parsing of two rows: correct/incorrect from index | changes from index", async () => {
        when(settingsMock.shouldCollectGitChangesFromIndex()).thenReturn(true);
        const statusRow = "A  path1/path2/path3/file1";
        const statusRow2 = "U  path1/path2/path3/file1";

        const parser: GitStatusRowsParser = await getParser();
        const rows: CvsResource[] = parser.tryParseRows(workspaceRootPath, [statusRow, statusRow2]);

        assert.equal(rows.length, 1);
    });

    test("should verify parsing of one correct row from working tree | changes from working tree", async () => {
        when(settingsMock.shouldCollectGitChangesFromIndex()).thenReturn(false);
        const statusRow = " A path1/path2/path3/file1";

        const parser: GitStatusRowsParser = await getParser();
        const rows: CvsResource[] = parser.tryParseRows(workspaceRootPath, [statusRow]);

        assert.equal(rows.length, 1);
        assert.equal(rows[0].status, CvsFileStatusCode.ADDED);
        assert.equal(rows[0].fileName, "path1/path2/path3/file1");
    });

    test("should verify parsing of one incorrect row from working tree | changes from working tree", async () => {
        when(settingsMock.shouldCollectGitChangesFromIndex()).thenReturn(false);
        const statusRow = " U path1/path2/path3/file1";

        const parser: GitStatusRowsParser = await getParser();
        const rows: CvsResource[] = parser.tryParseRows(workspaceRootPath, [statusRow]);

        assert.equal(rows.length, 0);
    });

    test("should verify parsing of two correct row from working tree | changes from working tree", async () => {
        when(settingsMock.shouldCollectGitChangesFromIndex()).thenReturn(false);
        const statusRow = " A path1/path2/path3/file1";
        const statusRow2 = " M path1/path2/path3/file1";

        const parser: GitStatusRowsParser = await getParser();
        const rows: CvsResource[] = parser.tryParseRows(workspaceRootPath, [statusRow, statusRow2]);

        assert.equal(rows.length, 2);
    });

    test("should verify parsing of two rows: correct/incorrect from working tree | changes from working tree",
        async () => {
            when(settingsMock.shouldCollectGitChangesFromIndex()).thenReturn(false);
            const statusRow = " A path1/path2/path3/file1";
            const statusRow2 = " U path1/path2/path3/file1";

            const parser: GitStatusRowsParser = await getParser();
            const rows: CvsResource[] = parser.tryParseRows(workspaceRootPath, [statusRow, statusRow2]);

            assert.equal(rows.length, 1);
        });

    test("should verify parsing of two rows: correct row from index and working tree | changes from index",
        async () => {
            when(settingsMock.shouldCollectGitChangesFromIndex()).thenReturn(true);
            const statusRow = "A  path1/path2/path3/file1";
            const statusRow2 = " A path3/path4/path5/file2";

            const parser: GitStatusRowsParser = await getParser();
            const rows: CvsResource[] = parser.tryParseRows(workspaceRootPath, [statusRow, statusRow2]);

            assert.equal(rows.length, 1);
            assert.equal(rows[0].fileName, "path1/path2/path3/file1");
        });

    test("should verify parsing of two rows: correct row from index and working tree | changes from working tree",
        async () => {
            when(settingsMock.shouldCollectGitChangesFromIndex()).thenReturn(false);
            const statusRow = "A  path1/path2/path3/file1";
            const statusRow2 = " A path3/path4/path5/file2";

            const parser: GitStatusRowsParser = await getParser();
            const rows: CvsResource[] = parser.tryParseRows(workspaceRootPath, [statusRow, statusRow2]);

            assert.equal(rows.length, 2);
        });
});
