"use strict";

import {assert} from "chai";
import {ByteWriter} from "../../src/utils/bytewriter";

suite("ByteWriter", () => {
    test("should verify writeUTF with empty string", function () {
        const buffer: Buffer = new Buffer(2);
        buffer[0] = 0;
        buffer[1] = 0;
        assert.isTrue(areBuffersEqual(ByteWriter.writeUTF(""), buffer));
    });

    test("should verify writeUTF with not empty string", function () {
        const buffer: Buffer = new Buffer(19);
        buffer[0] = 0;
        buffer[1] = 17; // Two first bytes are the size of the byte array
        buffer[2] = 58;
        buffer[3] = 47;
        buffer[4] = 113;
        buffer[5] = 119;
        buffer[6] = 101;
        buffer[7] = 114;
        buffer[8] = 116;
        buffer[9] = 121;
        buffer[10] = 50;
        buffer[11] = 33;
        buffer[12] = 32;
        buffer[13] = 124;
        buffer[14] = 43;
        buffer[15] = 61;
        buffer[16] = 63;
        buffer[17] = 38;
        buffer[18] = 36;
        assert.isTrue(areBuffersEqual(ByteWriter.writeUTF(":/qwerty2! |+=?&$"), buffer));
    });

    test("should verify writeByte with correct number", function () {
        const buffer: Buffer = new Buffer(1);
        buffer[0] = 0;
        assert.isTrue(areBuffersEqual(ByteWriter.writeByte(0), buffer));
        buffer[0] = 1;
        assert.isTrue(areBuffersEqual(ByteWriter.writeByte(1), buffer));
        buffer[0] = 255;
        assert.isTrue(areBuffersEqual(ByteWriter.writeByte(255), buffer));
        buffer[0] = 257;
        assert.isTrue(areBuffersEqual(ByteWriter.writeByte(257), buffer));
    });

    test("should verify longToByteArray with correct number", function () {
        const buffer: Buffer = new Buffer(8);
        buffer[0] = 0;
        buffer[1] = 0;
        buffer[2] = 0;
        buffer[3] = 0;
        buffer[4] = 0;
        buffer[5] = 0;
        buffer[6] = 65;
        buffer[7] = 160;
        assert.isTrue(areBuffersEqual(ByteWriter.longToByteArray(16800), buffer));
    });
});

function areBuffersEqual(bufA: Buffer, bufB: Buffer) {
    const len = bufA.length;
    if (len !== bufB.length) {
        return false;
    }
    for (let i = 0; i < len; i++) {
        if (bufA.readUInt8(i) !== bufB.readUInt8(i)) {
            return false;
        }
    }
    return true;
}
