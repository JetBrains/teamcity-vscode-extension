"use strict";

export interface AsyncChildProcess {
    exec(arg: string): Promise<any>;
    spawn(...args: string[]): Promise<any>;
}
