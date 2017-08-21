"use strict";

import {assert} from "chai";
import {VsCodeUtils} from "../../src/utils/vscodeutils";

suite("VSCodeUtils", () => {

    test("should verify VSCodeUtils parseValueColonValue", function () {
        const key = VsCodeUtils.parseValueColonValue("qwerrtyu:12345678");
        assert.equal(key[0], "qwerrtyu");
        assert.equal(key[1], "12345678");
    });

    test("should verify VSCodeUtils parseValueColonValue - incorrect value", function () {
        assert.equal(VsCodeUtils.parseValueColonValue("qwerrtyu12345678"), undefined);
        assert.equal(VsCodeUtils.parseValueColonValue("qwerrtyu:12345678:zxcvbnmb"), undefined);
    });

    test("should verify formatErrorMessage", function () {
        const errMsg: string = "An error message";
        const err: Error = new Error(errMsg);
        assert.equal(VsCodeUtils.formatErrorMessage(err), errMsg);
    });

    test("should verify formatErrorMessage with stderr", function () {
        const errMsg: string = "An error message";
        const stderr: string = "An stderr message";
        const err: any = new Error(errMsg);
        err.stderr = stderr;
        assert.equal(VsCodeUtils.formatErrorMessage(err), errMsg + " " + stderr);
    });

    test("should verify formatErrorMessage with incorrect arg", function () {
        const errMsg: string = "I am not an error";
        assert.equal(VsCodeUtils.formatErrorMessage(errMsg), "");
    });

    test("should verify uniqBy method", function () {
        const obj1: TestObject = {a: "a1", b: "b1"};
        const obj2: TestObject = {a: "a2", b: "b2"};
        const obj3: TestObject = {a: "a1", b: "b3"};
        const arr: TestObject[] = [obj1, obj2, obj3];
        assert.equal(VsCodeUtils.uniqBy<TestObject>(arr, (element) => element.a).length, 2);
    });

    test("should verify uniqBy method with empty arg", function () {
        const arr: TestObject[] = [];
        assert.equal(VsCodeUtils.uniqBy<TestObject>(arr, (element) => element.a).length, 0);
    });

    test("should verify uniqBy method with undefined arg", function () {
        assert.equal(VsCodeUtils.uniqBy<TestObject>(undefined, (element) => element.a).length, 0);
    });

    test("should verify uniqBy method with wrong key", function () {
        const arr: TestObject[] = [{a: "a1", b: "b1"}];
        assert.equal(VsCodeUtils.uniqBy<any>(arr, (element) => element.c).length, 1);

        //object.c property is undefined
        arr.push({a: "a2", b: "b2"});
        assert.equal(VsCodeUtils.uniqBy<any>(arr, (element) => element.c).length, 1);
    });

    test("should verify uniqBy method with all different elements", function () {
        const obj1: TestObject = {a: "a1", b: "b1"};
        const obj2: TestObject = {a: "a2", b: "b2"};
        const obj3: TestObject = {a: "a3", b: "b3"};
        const arr: TestObject[] = [obj1, obj2, obj3];
        assert.equal(VsCodeUtils.uniqBy<TestObject>(arr, (element) => element.a).length, 3);
    });

    test("should verify uuidv4 method", function () {
        const uuidRegExpMask = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$/;
        assert.isTrue(uuidRegExpMask.test(VsCodeUtils.uuidv4()));
        assert.isTrue(uuidRegExpMask.test(VsCodeUtils.uuidv4()));
        assert.isTrue(uuidRegExpMask.test(VsCodeUtils.uuidv4()));
    });
});

interface TestObject {
    a: string;
    b: string;
}
