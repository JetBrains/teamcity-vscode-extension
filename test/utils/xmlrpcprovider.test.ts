"use strict";

import {assert} from "chai";
import {XmlRpcProvider} from "../../src/entities/xmlrpcprovider";

suite("XmlRpcProvider", () => {
    test("should verify XmlRpcProvider constructor", function () {
        const provider: XmlRpcProvider = new XmlRpcProvider("http://localhost");
        assert.isNotNull(provider.getTestObject().client);
    });
});
