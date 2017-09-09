"use strict";

export interface AsyncFs {
    readdir(path: string): Promise<string[]>;
}
