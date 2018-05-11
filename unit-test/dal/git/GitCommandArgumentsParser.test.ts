import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });

import * as assert from "assert";
import {GitCommandArgumentsParser} from "../../../src/dal/git/GitCommandArgumentsParser";
import {GitParsedStatusRow} from "../../../src/bll/cvsutils/git-status-row";

suite("GitCommandArgumentsParser", () => {

    const parser = new GitCommandArgumentsParser();

    test("should verify parsing of a row with an added file", function () {
        const addedFile = "A  path1/path2/path3/file1";
        const result: GitParsedStatusRow = parser.parseStatusRow(addedFile);
        assert.equal(result.status, "A");
        assert.equal(result.relativePath, "path1/path2/path3/file1");
        assert.equal(result.prevRelativePath, undefined);
    });

    test("should verify parsing of a row with a modified file", function () {
        const addedFile = "M  path1/path2/path3/file1";
        const result: GitParsedStatusRow = parser.parseStatusRow(addedFile);
        assert.equal(result.status, "M");
        assert.equal(result.relativePath, "path1/path2/path3/file1");
        assert.equal(result.prevRelativePath, undefined);
    });

    test("should verify parsing of a row with a deleted file", function () {
        const addedFile = "D  path1/path2/path3/file1";
        const result: GitParsedStatusRow = parser.parseStatusRow(addedFile);
        assert.equal(result.status, "D");
        assert.equal(result.relativePath, "path1/path2/path3/file1");
        assert.equal(result.prevRelativePath, undefined);
    });

    test("should verify parsing of a row with a replaced file", function () {
        const addedFile = "R  path1/path2/path3/file1 -> path4/path5/file2";
        const result: GitParsedStatusRow = parser.parseStatusRow(addedFile);
        assert.equal(result.status, "R");
        assert.equal(result.prevRelativePath, "path1/path2/path3/file1");
        assert.equal(result.relativePath, "path4/path5/file2");
    });

    test("should verify parsing of a row with a replaced file", function () {
        const addedFile = "U  path1/path2/path3/file1";
        try {
            assert.throws(() => parser.parseStatusRow(addedFile));
        } catch (err) {
            // it's good
        }
    });

    test("should verify parsing of a row with a replaced file", function () {
        const addedFile = "Some not parsing things";
        try {
            assert.throws(() => parser.parseStatusRow(addedFile));
        } catch (err) {
            // it's good
        }
    });
});
