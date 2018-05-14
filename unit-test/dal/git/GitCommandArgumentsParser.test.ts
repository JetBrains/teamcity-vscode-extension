import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });

import * as assert from "assert";
import {GitCommandArgumentsParser} from "../../../src/dal/git/GitCommandArgumentsParser";
import {GitParsedStatusRow} from "../../../src/bll/cvsutils/git-status-row";

suite("GitCommandArgumentsParser", () => {

    test("should verify parsing of a row with an added file at index", function () {
        const addedFile = "A  path1/path2/path3/file1";
        const result: GitParsedStatusRow = GitCommandArgumentsParser.parseStatusRow(addedFile);
        assert.equal(result.indexStatus, "A");
        assert.equal(result.workingTreeStatus, undefined);
        assert.equal(result.relativePath, "path1/path2/path3/file1");
        assert.equal(result.prevRelativePath, undefined);
    });

    test("should verify parsing of a row with a modified file at index", function () {
        const addedFile = "M  path1/path2/path3/file1";
        const result: GitParsedStatusRow = GitCommandArgumentsParser.parseStatusRow(addedFile);
        assert.equal(result.indexStatus, "M");
        assert.equal(result.workingTreeStatus, undefined);
        assert.equal(result.relativePath, "path1/path2/path3/file1");
        assert.equal(result.prevRelativePath, undefined);
    });

    test("should verify parsing of a row with a deleted file at index", function () {
        const addedFile = "D  path1/path2/path3/file1";
        const result: GitParsedStatusRow = GitCommandArgumentsParser.parseStatusRow(addedFile);
        assert.equal(result.indexStatus, "D");
        assert.equal(result.workingTreeStatus, undefined);
        assert.equal(result.relativePath, "path1/path2/path3/file1");
        assert.equal(result.prevRelativePath, undefined);
    });

    test("should verify parsing of a row with a replaced file at index", function () {
        const addedFile = "R  path1/path2/path3/file1 -> path4/path5/file2";
        const result: GitParsedStatusRow = GitCommandArgumentsParser.parseStatusRow(addedFile);
        assert.equal(result.indexStatus, "R");
        assert.equal(result.workingTreeStatus, undefined);
        assert.equal(result.prevRelativePath, "path1/path2/path3/file1");
        assert.equal(result.relativePath, "path4/path5/file2");
    });

    test("should verify parsing of a row with a copied file at index", function () {
        const addedFile = "C  path1/path2/path3/file1 -> path4/path5/file2";
        const result: GitParsedStatusRow = GitCommandArgumentsParser.parseStatusRow(addedFile);
        assert.equal(result.indexStatus, "C");
        assert.equal(result.workingTreeStatus, undefined);
        assert.equal(result.prevRelativePath, "path1/path2/path3/file1");
        assert.equal(result.relativePath, "path4/path5/file2");
    });

    test("should verify parsing of a row with an added file at working tree", function () {
        const addedFile = " A path1/path2/path3/file1";
        const result: GitParsedStatusRow = GitCommandArgumentsParser.parseStatusRow(addedFile);
        assert.equal(result.workingTreeStatus, "A");
        assert.equal(result.indexStatus, undefined);
        assert.equal(result.relativePath, "path1/path2/path3/file1");
        assert.equal(result.prevRelativePath, undefined);
    });

    test("should verify parsing of a row with a modified file at working tree", function () {
        const addedFile = " M path1/path2/path3/file1";
        const result: GitParsedStatusRow = GitCommandArgumentsParser.parseStatusRow(addedFile);
        assert.equal(result.workingTreeStatus, "M");
        assert.equal(result.indexStatus, undefined);
        assert.equal(result.relativePath, "path1/path2/path3/file1");
        assert.equal(result.prevRelativePath, undefined);
    });

    test("should verify parsing of a row with a deleted file at working tree", function () {
        const addedFile = " D path1/path2/path3/file1";
        const result: GitParsedStatusRow = GitCommandArgumentsParser.parseStatusRow(addedFile);
        assert.equal(result.workingTreeStatus, "D");
        assert.equal(result.indexStatus, undefined);
        assert.equal(result.relativePath, "path1/path2/path3/file1");
        assert.equal(result.prevRelativePath, undefined);
    });

    test("should verify replaced files at working tree not supported", function () {
        const addedFile = " R path1/path2/path3/file1 -> path4/path5/file2";
        assert.throws(() => GitCommandArgumentsParser.parseStatusRow(addedFile));
    });

    test("should verify copied files at working tree not supported", function () {
        const addedFile = " C path1/path2/path3/file1 -> path4/path5/file2";
        assert.throws(() => GitCommandArgumentsParser.parseStatusRow(addedFile));
    });

    test("should verify parsing of a row with a replaced file", function () {
        const addedFile = " U path1/path2/path3/file1";
        assert.throws(() => GitCommandArgumentsParser.parseStatusRow(addedFile));
    });

    test("should verify parsing of a row with a replaced file", function () {
        const addedFile = "Some not parsing things";
        assert.throws(() => GitCommandArgumentsParser.parseStatusRow(addedFile));
    });
});
