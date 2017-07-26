"use strict";

import { assert, expect } from "chai";
import { VsCodeUtils } from "../../src/utils/vscodeutils";
import { XmlRpcProvider } from "../../src/utils/xmlrpcprovider";

suite("XmlRpcProvider", () => {

    test("should verify XmlRpcProvider constructor", function() {
        const provider : XmlRpcProvider = new XmlRpcProvider("http://localhost");
        assert.isNotNull(provider.getTestObject().client);
    });
});
