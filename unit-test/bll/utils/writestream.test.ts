import * as path from "path";
import * as fs_async from "async-file";
import {AsyncWriteStream} from "../../../src/dal/asyncwritestream";

suite("WriteStream", () => {
    test("should verify typical useCase for asyncWriteStream", function (done) {
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
        //TODO: move to the temp folder
        const fileAbsPath: string = path.join(__dirname, ".testPatch");
        const asyncWriteStream: AsyncWriteStream = new AsyncWriteStream(fileAbsPath);
        asyncWriteStream.write(buffer).then(() => {
            asyncWriteStream.dispose();
            fs_async.readFile(fileAbsPath).then((data: Buffer) => {
                fs_async.unlink(fileAbsPath).then(() => {
                    if (areBuffersEqual(buffer, data)) {
                        done();
                    } else {
                        done("File content is incorrect");
                    }
                }).catch((err) => done(err));
            }).catch((err) => done(err));
        }).catch((err) => done(err));
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
