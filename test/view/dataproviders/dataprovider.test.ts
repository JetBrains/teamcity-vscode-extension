"use strict";

import {assert} from "chai";
import {ProviderManager} from "../../../src/view/providermanager";

suite("DataProviders", () => {
    test("should verify default selected data provider", function () {
        const dp = new ProviderManager();
        assert.isUndefined(dp.getShownDataProvider());
    });
});

