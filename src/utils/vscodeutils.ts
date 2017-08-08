"use strict";

import { window, MessageItem, workspace } from "vscode";
import { Strings } from "../utils/strings";
import { Logger } from "../utils/logger";
import { Credential } from "../credentialstore/credential";
import { ChangeItemProxy, BuildItemProxy } from "../notifications/summarydata";
import XHR = require("xmlhttprequest");
import pako = require("pako");
import fs = require("fs");

export class VsCodeUtils {

    public static async showErrorMessage(messageToDisplay: string, ...messageItems : MessageItem[]) : Promise<MessageItem> {
        return await window.showErrorMessage(messageToDisplay, ...messageItems);
    }

    public static async showInfoMessage(messageToDisplay: string, ...messageItems : MessageItem[]) : Promise<MessageItem> {
        return await window.showInformationMessage(messageToDisplay, ...messageItems);
    }

    public static async showWarningMessage(messageToDisplay: string, ...messageItems : MessageItem[]) : Promise<MessageItem> {
        return await window.showWarningMessage(messageToDisplay, ...messageItems);
    }

    public static async displayNoCredentialsMessage(): Promise<void> {
        const displayError: string = Strings.NO_CREDENTIALS_RUN_SIGNIN;
        VsCodeUtils.showErrorMessage(displayError);
    }

    public static async displayNoSelectedConfigsMessage(): Promise<void> {
        const displayError: string = Strings.NO_CONFIGS_RUN_REMOTERUN;
        VsCodeUtils.showErrorMessage(displayError);
    }

    public static async displayNoTccUtilMessage(): Promise<void> {
        const displayError: string = Strings.NO_TCC_UTIL;
        VsCodeUtils.showErrorMessage(displayError);
    }

    /**
     * @param value - any string in the format ${value1:value2}
     * @return - an array in the format ${[value1, value2]}
     */
    public static parseValueColonValue(value : string) : string[] {
        const KEY_SEPARATOR : string = ":";
        if (value === undefined || !value.indexOf(KEY_SEPARATOR)) {
            Logger.logWarning(`VsCodeUtils#parseValueColonValue: value ${value} wasn't parsed`);
            return undefined;
        }
        const keys = value.split(KEY_SEPARATOR);
        return keys.length !== 2 ? undefined : keys;
    }

    public static gzip2Str(gzip : Uint8Array[]) : string {
        Logger.logDebug(`VsCodeUtils#gzip2Str: starts unziping gzip`);
        const buffer : string[] = [];
        // Pako magic
        const inflatedGzip : Uint16Array = pako.inflate(gzip);
        // Convert gunzipped byteArray back to ascii string:
        for (let i : number = 0; i < inflatedGzip.byteLength; i = i + 200000) {
            /*RangeError: Maximum call stack size exceeded when i is between 250000 and 260000*/
            const topIndex = Math.min(i + 200000, inflatedGzip.byteLength);
            /* tslint:disable:no-null-keyword */
            buffer.push(String.fromCharCode.apply(null, new Uint16Array(inflatedGzip.slice(i, topIndex))));
            /* tslint:enable:no-null-keyword */
        }
        Logger.logDebug(`VsCodeUtils#gzip2Str: finishes unziping gzip`);
        return buffer.join("");
    }

        /**
     * @param method - type of request (GET, POST, ...)
     * @param url - url of request
     * @param cred? - Credential for basic authorization
     * @return Promise with request.response in case of success, otherwise a reject with status of response and statusText.
     */
    public static makeRequest(method, url : string, cred? : Credential) {
        Logger.logDebug(`VsCodeUtils#makeRequest: url: ${url} by ${method}`);
        const XMLHttpRequest = XHR.XMLHttpRequest;
        return new Promise(function (resolve, reject) {
            const request : XHR.XMLHttpRequest = new XMLHttpRequest();
            request.open(method, url, true);
            if (cred) {
                Logger.logDebug(`VsCodeUtils#makeRequest: creds:`);
                Logger.LogObject(cred);
                request.setRequestHeader("Authorization", "Basic " + new Buffer(cred.user + ":" + cred.pass).toString("base64"));
            }
            request.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(request.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: request.statusText
                    });
                }
            };
            request.onerror = function () {
                reject({
                    status: this.status,
                    statusText: request.statusText
                });
            };
            request.send();
        });
    }

    public static async tryMakeChangesRequest() : Promise<string> {//%3a == : %2f ==// %7c ==|
        const str : string = `jetbrains.git://|https://github.com/rugpanov/JavaHelloWorld|/README.md`;
        const buffer1 : Buffer = WriteByte(25);
        const buffer2 : Buffer = WriteUTF(str);
        const buffer25 : Buffer = await WriteFile("C:/Users/user/Documents/Projects/examples/JavaHelloWorld/README.md");
        const buffer3 : Buffer = WriteByte(10);
        const newBuffer = Buffer.concat([buffer1, buffer2, buffer3, WriteUTF("")]);
        const XMLHttpRequest = XHR.XMLHttpRequest;
        const prom : Promise<string> = new Promise(function (resolve, reject) {
            const request : XHR.XMLHttpRequest = new XMLHttpRequest();
            request.open("POST", "http://localhost/uploadChanges.html?userId=1&description=\"asdsadasdsadasd\"&commitType=0", true);
            const cred = new Credential("http://localhost", "rugpanov", "");
            if (cred) {
                request.setRequestHeader("Authorization", "Basic " + new Buffer(cred.user + ":" + cred.pass).toString("base64"));
            }
            request.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(this.responseText);
                } else {
                    reject({
                        status: this.status,
                        statusText: request.statusText
                    });
                }
            };
            request.onerror = function () {
                reject({
                    status: this.status,
                    statusText: request.statusText
                });
            };
            request.send(newBuffer);
        });
        return prom;
    }

    public static triggerChanges(id : number) {//JavaHelloWorld_JavaHelloWorldBuild
        const str = `<?xml version="1.0" encoding="UTF-8"?>
<build>
  <triggeringOptions cleanSources="true" rebuildAllDependencies="true" queueAtTop="true"/>
  <buildType id="JavaHelloWorld_JavaHelloWorldBuild"/>
  <lastChanges>
    <change id="207"/>
  </lastChanges>
</build>`;
        const XMLHttpRequest = XHR.XMLHttpRequest;
        return new Promise(function (resolve, reject) {
            const request : XHR.XMLHttpRequest = new XMLHttpRequest();
            request.open("POST", "http://localhost/app/rest/buildQueue", true);
            const cred = new Credential("http://localhost", "rugpanov", "");
            if (cred) {
                request.setRequestHeader("Authorization", "Basic " + new Buffer(cred.user + ":" + cred.pass).toString("base64"));
                request.setRequestHeader("Content-Type", "application/xml");
            }
            request.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(request.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: request.statusText
                    });
                }
            };
            request.onerror = function () {
                reject({
                    status: this.status,
                    statusText: request.statusText
                });
            };
            request.send(str);
        });
    }
    /**
     * This method prepares message to display from change items and user credential.
     * @param change - changeItemProxy
     * @param cred - user credential. Required to get serverUrl.
     */
    public static formMessage(change : ChangeItemProxy, cred : Credential) : string {
        const changePrefix = change.isPersonal ? "Personal change" : "Change";
        const messageSB : string[] = [];
        messageSB.push(`${changePrefix} #${change.changeId} has "${change.status}" status.`);
        const builds : BuildItemProxy[] = change.builds;
        if (builds) {
            builds.forEach((build) => {
                const buildPrefix = build.isPersonal ? "Personal build" : "Build";
                const buildChangeUrl = `${cred.serverURL}/viewLog.html?buildId=${build.buildId}`;
                if (build.buildId !== -1) {
                    messageSB.push(`${buildPrefix} #${build.buildId} has "${build.status}" status. More detales: ${buildChangeUrl}`);
                }
            });
        }
        return messageSB.join("\n");
    }

    /**
     * Prepares an error for writting into log
     * @param err - an error
     */
    public static formatErrorMessage(err) : string {
        if (!err || !err.message) {
            return "";
        }
        let formattedMsg : string = err.message;
        if (err.stderr) {
            formattedMsg = `${formattedMsg} ${err.stderr}`;
        }
        return formattedMsg;
    }

    /**
     * This method filters an array and returns elements which has only uniq keys
     * @param arr - an array which should be filtered
     * @param fn - a filter function which should return the uniq key
     */
    public static uniqBy<T>(arr: T[], fn: (el: T) => string): T[] {
        if (!arr) {
            return [];
        }
        // tslint:disable-next-line:no-null-keyword
        const seen = Object.create(null);
        return arr.filter((el) => {
            const key = fn(el);
            if (seen[key]) {
                return false;
            }

            seen[key] = true;
            return true;
        });
    }

    /**
     * This method generates uniq UUID in the format "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".
     */
    public static uuidv4() : string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            // tslint:disable-next-line:no-bitwise
            const r = Math.random() * 16 | 0;
            // tslint:disable-next-line:no-bitwise
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

function WriteUTF(str : string) : Buffer {
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
    //myStream.Write(bytearr, 0, utflen + 2);
}

function WriteByte(code : number) : Buffer {
    const bu : Buffer = new Buffer(1);
    bu[0] = code & 0xff, code / 256 >>> 0;
    return bu;
}

function longToByteArray (long : number) {
    // we want to represent the input as a 8-bytes array
    const byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
    for ( let index = 0; index < byteArray.length; index ++ ) {
        const byte = long & 0xff;
        byteArray [ index ] = byte;
        long = (long - byte) / 256 ;
    }
    return byteArray;
}

function WriteLong(a : number) : Buffer {
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

async function WriteFile(name : string) : Promise<Buffer> {
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
        const bufferLength : Buffer = WriteLong(fileContentBuffer.length);
        return Buffer.concat([bufferLength, fileContentBuffer]);
    } catch (err) {
        throw new Error("Failed to read file '" + name + "'. " + VsCodeUtils.formatErrorMessage(err));
    }
}
