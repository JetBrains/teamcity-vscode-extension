import {assert} from "chai";

suite("test", () => {
    test("test1", function () {
        assert.equal(1, 1);
    });

    test("test2", function () {
        assert.notEqual(1, 2);
    });
});
