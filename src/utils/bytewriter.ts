"use strict";

import { VsCodeUtils } from "../utils/vscodeutils";

export class ByteWriter {

    
    public static writeUTF(str : string) : Buffer {
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
            throw new Error("UTF encoding: encoded string too long: " + utflen + " bytes");
        }

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
        const bu : Buffer = new Buffer(1);
        bu[0] = code & 0xff, code / 256 >>> 0;
        return bu;
    }

    public static longToByteArray (long : number) {
        // we want to represent the input as a 8-bytes array
        const byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
        for ( let index = 0; index < byteArray.length; index ++ ) {
            const byte = long & 0xff;
            byteArray [ index ] = byte;
            long = (long - byte) / 256 ;
        }
        return byteArray;
    }

    public static writeLong(a : number) : Buffer {
        const buffer : Buffer = new Buffer(8);
        buffer[0] = (a >> 56);
        buffer[1] = (a >> 48);
        buffer[2] = (a >> 40);
        buffer[3] = (a >> 32);
        buffer[4] = (a >> 24);
        buffer[5] = (a >> 16);
        buffer[6] = (a >> 8);
        buffer[7] = (a >> 0);
        return buffer;
    }

    public static async writeFile(name : string) : Promise<Buffer> {
        try {
            const fs = require("fs");
            const prom : Promise<Buffer> = new Promise((resolve, reject) => {
                fs.readFile(name, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(data);
                });
            });
            const fileContentBuffer : Buffer = await prom;
            const bufferLength : Buffer = ByteWriter.writeLong(fileContentBuffer.length);
            return Buffer.concat([bufferLength, fileContentBuffer]);
        } catch (err) {
            throw new Error("Failed to read file '" + name + "'. " + VsCodeUtils.formatErrorMessage(err));
        }
    }
}
