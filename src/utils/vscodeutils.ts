"use strict";

import * as pako from "pako";
import * as XHR from "xmlhttprequest";
import {Logger} from "./logger";
import {MessageItem, window, workspace} from "vscode";
import {Credentials} from "../credentialsstore/credentials";
import {MessageConstants} from "./MessageConstants";
import {RestHeader} from "../interfaces/RestHeader";
import {ChangeItemProxy} from "../entities/ChangeItemProxy";
import {BuildItemProxy} from "../entities/BuildItemProxy";

export class VsCodeUtils {

    public static async showErrorMessage(messageToDisplay: string, ...messageItems: MessageItem[]): Promise<MessageItem> {
        return await window.showErrorMessage(messageToDisplay, ...messageItems);
    }

    public static async showInfoMessage(messageToDisplay: string, ...messageItems: MessageItem[]): Promise<MessageItem> {
        return await window.showInformationMessage(messageToDisplay, ...messageItems);
    }

    public static async showWarningMessage(messageToDisplay: string, ...messageItems: MessageItem[]): Promise<MessageItem> {
        return await window.showWarningMessage(messageToDisplay, ...messageItems);
    }

    public static async displayNoCredentialsMessage(): Promise<void> {
        const displayError: string = MessageConstants.NO_CREDENTIALS_RUN_SIGNIN;
        VsCodeUtils.showErrorMessage(displayError);
    }

    public static async displayNoSelectedConfigsMessage(): Promise<void> {
        const displayError: string = MessageConstants.NO_CONFIGS_RUN_REMOTERUN;
        VsCodeUtils.showErrorMessage(displayError);
    }

    public static async displayNoTccUtilMessage(): Promise<void> {
        const displayError: string = MessageConstants.NO_TCC_UTIL;
        VsCodeUtils.showErrorMessage(displayError);
    }

    /**
     * @param value - any string in the format ${value1:value2}
     * @return - an array in the format ${[value1, value2]}
     */
    public static parseValueColonValue(value: string): string[] {
        const KEY_SEPARATOR: string = ":";
        if (value === undefined || !value.indexOf(KEY_SEPARATOR)) {
            Logger.logWarning(`VsCodeUtils#parseValueColonValue: value ${value} wasn't parsed`);
            return undefined;
        }
        const keys = value.split(KEY_SEPARATOR);
        return keys.length !== 2 ? undefined : keys;
    }

    public static gzip2Str(gzip: Uint8Array[]): string {
        Logger.logDebug(`VsCodeUtils#gzip2Str: starts unzipping gzip`);
        const buffer: string[] = [];
        // Pako magic
        const inflatedGzip: Uint16Array = pako.inflate(gzip);
        // Convert gzipped byteArray back to ascii string:
        for (let i: number = 0; i < inflatedGzip.byteLength; i = i + 200000) {
            /*RangeError: Maximum call stack size exceeded when i is between 250000 and 260000*/
            const topIndex = Math.min(i + 200000, inflatedGzip.byteLength);
            /* tslint:disable:no-null-keyword */
            buffer.push(String.fromCharCode.apply(null, new Uint16Array(inflatedGzip.slice(i, topIndex))));
            /* tslint:enable:no-null-keyword */
        }
        Logger.logDebug(`VsCodeUtils#gzip2Str: finishes unzipping gzip`);
        return buffer.join("");
    }

    /**
     * @param method - type of request (GET, POST, ...)
     * @param url - url of request
     * @param credentials? - Credential for basic authorization
     * @param data - POST content
     * @param additionalArgs - additional args in the url
     * @param additionalHeaders - additional headers =)
     * @return Promise with request.response in case of success, otherwise a reject with status of response and statusText.
     */
    public static makeRequest(method: string,
                              url: string,
                              credentials?: Credentials,
                              data?: Buffer | String,
                              additionalArgs?: string[],
                              additionalHeaders?: RestHeader[]): Promise<string> {
        Logger.logDebug(`VsCodeUtils#makeRequest: url: ${url} by ${method}`);
        //Add additional args to url
        if (additionalArgs) {
            const urlBuilder: string[] = [];
            urlBuilder.push(url);
            urlBuilder.push("?");
            additionalArgs.forEach((arg) => {
                urlBuilder.push(arg);
                urlBuilder.push("&");
            });
            url = urlBuilder.join("");
        }

        const XMLHttpRequest = XHR.XMLHttpRequest;
        return new Promise(function (resolve, reject) {
            const request: XHR.XMLHttpRequest = new XMLHttpRequest();
            request.open(method, url, true);
            if (credentials) {
                Logger.logDebug(`VsCodeUtils#makeRequest: credentials: userName ${credentials.user}, serverUrl ${credentials.serverURL}`);
                request.setRequestHeader("Authorization", "Basic " + new Buffer(credentials.user + ":" + credentials.password).toString("base64"));
            }

            if (additionalHeaders) {
                additionalHeaders.forEach((header) => {
                    request.setRequestHeader(header.header, header.value);
                });
            }

            request.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    if (request.response) {
                        resolve(request.response);
                    } else if (this.responseText) {
                        resolve(this.responseText);
                    } else {
                        resolve("");
                    }
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
            request.send(data);
        });
    }

    /**
     * This method prepares message to display from change items and user credential.
     * @param change - changeItemProxy
     * @param credentials - user credential. Required to get serverUrl.
     */
    public static formMessage(change: ChangeItemProxy, credentials: Credentials): string {
        const changePrefix = change.isPersonal ? "Personal build for change" : "Build for change";
        const messageSB: string[] = [];
        messageSB.push(`${changePrefix} #${change.changeId} has "${change.status}" status.`);
        const builds: BuildItemProxy[] = change.builds;
        if (builds) {
            builds.forEach((build) => {
                const buildPrefix = build.isPersonal ? "Personal build" : "Build";
                const buildChangeUrl = `${credentials.serverURL}/viewLog.html?buildId=${build.buildId}`;
                if (build.buildId !== -1) {
                    messageSB.push(`${buildPrefix} #${build.buildId} has "${build.status}" status. More details: ${buildChangeUrl}`);
                }
            });
        }
        return messageSB.join("\n");
    }

    /**
     * Prepares an error for writing into log
     * @param err - an error
     */
    public static formatErrorMessage(err): string {
        if (!err || !err.message) {
            return "";
        }
        let formattedMsg: string = err.message;
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
    public static uuidv4(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            // tslint:disable-next-line:no-bitwise
            const r = Math.random() * 16 | 0;
            // tslint:disable-next-line:no-bitwise
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * @param ms - Time of sleep in milliseconds
     */
    public static sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
