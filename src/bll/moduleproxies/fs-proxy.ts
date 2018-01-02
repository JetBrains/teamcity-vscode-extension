"use strict";

import * as fs_async from "async-file";
import {injectable} from "inversify";

@injectable()
export class FsProxy {
    public readFileAsync(filename: string | number, options?: {
        encoding?: "ascii" | "base64" | "binary" | "hex" | "ucs2" | "utf16le" | "utf8";
        flag?: "r" | "r+" | "rs" | "rs+" | "w" | "wx" | "w+" | "wx+" | "a" | "ax" | "a+" | "ax+";
    } | "ascii" | "base64" | "binary" | "hex" | "ucs2" | "utf16le" | "utf8" | "r" | "r+" | "rs" | "rs+" | "w" | "wx" | "w+" | "wx+" | "a" | "ax" | "a+" | "ax+"): Promise<any> {
        return fs_async.readFile(filename, options);
    }

    public existsAsync(path: string): Promise<boolean> {
        return fs_async.exists(path);
    }

    public writeFileAsync(filename: string | number, data: string | any, options?: {
        encoding?: "ascii" | "base64" | "binary" | "hex" | "ucs2" | "utf16le" | "utf8";
        flag?: "r" | "r+" | "rs" | "rs+" | "w" | "wx" | "w+" | "wx+" | "a" | "ax" | "a+" | "ax+";
        mode?: number | string;
    } | "ascii" | "base64" | "binary" | "hex" | "ucs2" | "utf16le" | "utf8" | "r" | "r+" | "rs" | "rs+" | "w" | "wx" | "w+" | "wx+" | "a" | "ax" | "a+" | "ax+"): Promise<void> {
        return fs_async.writeFile(filename, data, options);
    }

    public mkdirAsync(path: string, mode?: number | string): Promise<void> {
        return fs_async.mkdir(path, mode);
    }
}
