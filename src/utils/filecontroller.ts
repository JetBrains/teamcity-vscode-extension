"use strict";

import * as fs from "fs";
import {Logger} from "./logger";
import {VsCodeUtils} from "./vscodeutils";

export class FileController {

    /* Abs path should not contains symbols like " */
    public static async exists(fileAbsPath: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const exists: boolean = fs.existsSync(fileAbsPath);
            Logger.logDebug(`FileController#exists: file ${fileAbsPath} ${exists ? "exists" : "doesn't exist"}`);
            resolve(exists);
        });
    }

    public static async removeFileAsync(fileAbsPath: string) {
        Logger.logDebug(`FileController#removeFileAsync: should delete the ${fileAbsPath}`);
        const exist: boolean = await this.exists(fileAbsPath);
        if (!exist) {
            return;
        }

        return new Promise((resolve, reject) => {
            fs.unlink(fileAbsPath, (err) => {
                if (err) {
                    Logger.logError(`FileController#removeFileAsync: ${fileAbsPath} wasn't deleted. Error: ${VsCodeUtils.formatErrorMessage(err)}`);
                    reject(err);
                }
                Logger.logDebug(`FileController#removeFileAsync: ${fileAbsPath} was deleted`);
                resolve();
            });
        });
    }

    public static async writeFileAsync(fileAbsPath: string): Promise<Buffer> {
        Logger.logDebug(`FileController#writeFileAsync: should write the ${fileAbsPath}`);
        const exist: boolean = await this.exists(fileAbsPath);
        if (!exist) {
            return;
        }

        return new Promise<Buffer>((resolve, reject) => {
            fs.readFile(fileAbsPath, function (err: NodeJS.ErrnoException, data: Buffer) {
                if (err) {
                    Logger.logError(`FileController#writeFileAsync: an error occurs ${VsCodeUtils.formatErrorMessage(err)}`);
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    /* If file with this name exists, it will be rewritten */
    public static async createFileAsync(fileAbsPath: string, fileContent: string) {
        Logger.logDebug(`FileController#createFileAsync: should create the ${fileAbsPath}`);
        const exist: boolean = await this.exists(fileAbsPath);
        if (exist) {
            await this.removeFileAsync(fileAbsPath);
        }
        return new Promise<void>((resolve, reject) => {
            fs.appendFile(fileAbsPath, fileContent, (err) => {
                if (err) {
                    Logger.logError(`FileController#createFileAsync: ${fileAbsPath} wasn't created. Error: ${VsCodeUtils.formatErrorMessage(err)}`);
                    reject(err);
                }
                Logger.logInfo(`FileController#createFileAsync: ${fileAbsPath} was created.`);
                resolve();
            });
        });
    }
}
