"use strict";

import { assert } from "chai";
import { VsCodeUtils } from "../../src/utils/vscodeutils";

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
});
