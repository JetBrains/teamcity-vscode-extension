"use strict";
import * as fs from "fs";

export class FileController {
    
    /* Abs path should not contains symbols like " */
    public static async exists(fileName : string) : Promise<boolean> {
        const prom : Promise<boolean> = new Promise((resolve, reject) => {
            resolve(fs.existsSync(fileName));
        });
        return prom;
    }

    public static async removeFileAsync(fileName : string) {
        const exist : boolean = await this.exists(fileName);
        if (!exist) {
            return;
        }

        return new Promise((resolve, reject) => {
            fs.unlink(fileName, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            })
        });
    }

    /* If file with this name exists, it will be rewritten */
    public static async createFileAsync(fileAbsPath : string, fileContent : string){
        const exist : boolean = await this.exists(fileAbsPath);
        if (exist) {
            await this.removeFileAsync(fileAbsPath);
        }
        return new Promise<void>((resolve, reject) => {
            fs.appendFile(fileAbsPath, fileContent, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            })
        });
    }
}