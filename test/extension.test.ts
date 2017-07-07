//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

// Test Sample
suite("Extension Tests", () => {

    test("Something 1", () => {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
});