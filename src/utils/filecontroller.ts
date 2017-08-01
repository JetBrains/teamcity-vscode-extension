"use strict";

import * as fs from "fs";
import { Logger } from "./logger";

export class FileController {

    /* Abs path should not contains symbols like " */
    public static async exists(fileName : string) : Promise<boolean> {
        const prom : Promise<boolean> = new Promise((resolve, reject) => {
            const exists : boolean = fs.existsSync(fileName);
            Logger.logDebug(`FileController#exists: file ${fileName} ${exists ? "exists" : "doesn't exist"}`);
            resolve();
        });
        return prom;
    }

    public static async removeFileAsync(fileName : string) {
        Logger.logDebug(`FileController#removeFileAsync: should delete the ${fileName}`);
        const exist : boolean = await this.exists(fileName);
        if (!exist) {
            return;
        }

        return new Promise((resolve, reject) => {
            fs.unlink(fileName, (err) => {
                if (err) {
                    Logger.logError(`FileController#removeFileAsync: ${fileName} wasn't deleted. Error: ${err}`);
                    reject(err);
                }
                Logger.logDebug(`FileController#removeFileAsync: ${fileName} was deleted`);
                resolve();
            });
        });
    }

    /* If file with this name exists, it will be rewritten */
    public static async createFileAsync(fileAbsPath : string, fileContent : string) {
        Logger.logDebug(`FileController#createFileAsync: should create the ${fileAbsPath}`);
        const exist : boolean = await this.exists(fileAbsPath);
        if (exist) {
            await this.removeFileAsync(fileAbsPath);
        }
        return new Promise<void>((resolve, reject) => {
            fs.appendFile(fileAbsPath, fileContent, (err) => {
                if (err) {
                    Logger.logError(`FileController#createFileAsync: ${fileAbsPath} wasn't created. Error: ${err}`);
                    reject(err);
                }
                Logger.logError(`FileController#createFileAsync: ${fileAbsPath} was created.`);
                resolve();
            });
        });
    }
}
