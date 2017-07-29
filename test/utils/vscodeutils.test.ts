"use strict";

import { assert } from "chai";
import { VsCodeUtils } from "../../src/utils/vscodeutils";
import * as http from "http";

suite("VSCodeUtils", () => {

    test("should verify VSCodeUtils parseValueColonValue", function() {
        const key = VsCodeUtils.parseValueColonValue("qwerrtyu:12345678");
        assert.equal(key[0], "qwerrtyu");
        assert.equal(key[1], "12345678");
    });

    test("should verify VSCodeUtils parseValueColonValue - incorrect value", function() {
        assert.equal(VsCodeUtils.parseValueColonValue("qwerrtyu12345678"), undefined);
        assert.equal(VsCodeUtils.parseValueColonValue("qwerrtyu:12345678:zxcvbnmb"), undefined);
    });

    test("should verify VSCodeUtils makeRequest - response 200", function(done) {
        const serv = http.createServer(function (req, res) {
            serv.close();
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end();
        }).listen(8239);
        VsCodeUtils.makeRequest("GET", "http://localhost:8239").then((response) => {
            done();
        }).catch(() => {
            done("There should be a success response here.");
        });
    });

    test("should verify VSCodeUtils makeRequest - response 400", function(done) {
        const serv = http.createServer(function (req, res) {
            serv.close();
            res.writeHead(404, {"Content-Type": "text/html"});
            res.end();
        }).listen(8339);
        VsCodeUtils.makeRequest("GET", "http://localhost:8339").then((response) => {
            done("makeRequest should catch an exception.");
        }).catch(() => {
            done();
        });
    });
});
