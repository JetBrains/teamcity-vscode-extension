import "reflect-metadata";
import {HttpRequestData} from "../../../src/bll/weblinklistener/httprequestdata";
import * as assert from "assert";

suite("HttpRequestData", function () {

    test("should verify constructors with unsupported requests", function () {
        const testParamsObject = {"buildId": "1", "testId": "2", "server": "3"};
        let hrd = new HttpRequestData("/file", {});
        assert.equal(hrd.isSupportedRequest(), false);

        hrd = new HttpRequestData("/test", testParamsObject);
        assert.equal(hrd.isSupportedRequest(), false);

        hrd = new HttpRequestData("/patch", testParamsObject);
        assert.equal(hrd.isSupportedRequest(), false);
    });

    test("should verify constructors with supported requests", function () {
        const fileParamsObject = {"file": "file.name"};
        const hrd = new HttpRequestData("/file", fileParamsObject);
        assert.equal(hrd.isSupportedRequest(), true);
    });

    test("should verify getFile with not undefined filename", function () {
        const FILE_NAME: string = "file.name";
        const fileParamsObject = {"file": FILE_NAME};
        const hrd = new HttpRequestData("/test", fileParamsObject);
        assert.equal(hrd.getFile(), FILE_NAME);
    });

    test("should verify getFile with undefined filename", function () {
        const hrd = new HttpRequestData("/test", {});
        assert.equal(hrd.getFile(), undefined);
    });
});
