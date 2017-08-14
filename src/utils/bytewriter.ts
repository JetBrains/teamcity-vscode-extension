"use strict";

import { Logger } from "../utils/logger";

export class ByteWriter {

    public static writeUTF(str : string) : Buffer {
        Logger.logDebug(`ByteWriter#writeUTF: writing str ${str}`);
        const strlen : number = str.length;
        let utflen : number = 0;
        let count : number = 0;
        for (let i = 0; i < strlen; i++) {
            const c : number = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                utflen++;
            } else if (c > 0x07FF) {
                utflen += 3;
            } else {
                utflen += 2;
            }
        }
        if (utflen > 65535) {
            Logger.logError(`ByteWriter#writeUTF: UTF encoding: encoded string too long: ${utflen} bytes`);
            throw new Error(`UTF encoding: encoded string too long: ${utflen} bytes`);
        }
        Logger.logDebug(`ByteWriter#writeUTF: UTF length is ${utflen}`);
        const bytearr = new Buffer(utflen + 2);
        // tslint:disable:no-bitwise
        bytearr[count++] = ((utflen >> 8) & 0xFF);
        bytearr[count++] = ((utflen >> 0) & 0xFF);
        let i : number;
        for (i = 0; i < strlen; i++) {
            const c : number = str.charCodeAt(i);
            if (!((c >= 0x0001) && (c <= 0x007F))) {
                break;
            }
            bytearr[count++] = c;
        }

        for (; i < strlen; i++) {
            const c : number = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                bytearr[count++] = c;
            } else if (c > 0x07FF) {
                bytearr[count++] = (0xE0 | ((c >> 12) & 0x0F));
                bytearr[count++] = (0x80 | ((c >> 6) & 0x3F));
                bytearr[count++] = (0x80 | ((c >> 0) & 0x3F));
            } else {
                bytearr[count++] = (0xC0 | ((c >> 6) & 0x1F));
                bytearr[count++] = (0x80 | ((c >> 0) & 0x3F));
            }
        }
        return bytearr;
    }

    public static writeByte(code : number) : Buffer {
        const buffer : Buffer = new Buffer(1);
        buffer[0] = code & 0xff, code / 256 >>> 0;
        return buffer;
    }

    /**
     * This method represents the input as a 8-bytes array
     * @param longInput the input
     * @return 8-bytes array as Buffer
     */
    public static longToByteArray(longInput : number) : Buffer {
        const buffer : Buffer = new Buffer(8);
        for ( let index = 0; index < buffer.length; index ++ ) {
            const byte = longInput & 0xff;
            buffer[buffer.length - index - 1] = byte;
            longInput = (longInput - byte) / 256 ;
        }
        return buffer;
    }
}
