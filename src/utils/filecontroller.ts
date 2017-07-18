"use strict";
import * as fs from "fs";

export class FileController {
    
    /* Abs path should not contains symbols like " */
    public static exists(fileName : string) : boolean {
        return fs.existsSync(fileName);
    }

    public static async removeFileAsync(fileName : string) {
        if (!this.exists(fileName)) {
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
        if (!this.exists(fileAbsPath)) {
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