import {Logger} from "./logger";

export class ByteWriter {

    public static writeUTF(str: string): Buffer {
        Logger.logDebug(`ByteWriter#writeUTF: writing str ${str}`);
        // tslint:disable:no-bitwise
        const strlen: number = str.length;
        if (strlen > 65535) {
            Logger.logError(`ByteWriter#writeUTF: UTF encoding: encoded string too long: ${strlen} bytes`);
            throw new Error(`UTF encoding: encoded string too long: ${strlen} bytes`);
        }
        Logger.logDebug(`ByteWriter#writeUTF: UTF length is ${strlen}`);
        const byteArrLength = new Buffer(2);
        byteArrLength[0] = ((strlen >> 8) & 0xFF);
        byteArrLength[1] = ((strlen >> 0) & 0xFF);
        return Buffer.concat([byteArrLength, Buffer.from(str)]);
    }

    public static writeByte(code: number): Buffer {
        const buffer: Buffer = new Buffer(1);
        buffer[0] = code & 0xff, code / 256 >>> 0;
        return buffer;
    }

    /**
     * This method represents the input as a 8-bytes array
     * @param longInput the input
     * @return 8-bytes array as Buffer
     */
    public static longToByteArray(longInput: number): Buffer {
        const buffer: Buffer = new Buffer(8);
        for (let index = 0; index < buffer.length; index++) {
            const byte = longInput & 0xff;
            buffer[buffer.length - index - 1] = byte;
            longInput = (longInput - byte) / 256;
        }
        return buffer;
    }

    public static byteArrayToLong(buffer: Buffer): number {
        if (!buffer) {
            return undefined;
        }
        let result: number = 0;
        let mul: number = 0;
        for (let index = 0; index < buffer.length; index++) {
            result += buffer[buffer.length - index - 1] * Math.pow(256, mul++);
        }
        return result;
    }
}
