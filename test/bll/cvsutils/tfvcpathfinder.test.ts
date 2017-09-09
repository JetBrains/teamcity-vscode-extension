"use strict";
import {TfvcPathFinder} from "../../../src/bll/cvsutils/tfvcpathfinder";
import {Process} from "../../../src/bll/moduleinterfaces/process";
import {Os} from "../../../src/bll/moduleinterfaces/os";
import * as assert from "assert";
import {AsyncChildProcess} from "../../../src/bll/moduleinterfaces/asyncchildprocess";

suite("Tfvc Path Finder", () => {
    test("should handle \"tf\" in path for win32", function (done) {
        const osMock = new OsMock("win32");
        const childProcessMock = new TfvcInPathChildProcessMock();
        const tfvcPathFinder: TfvcPathFinder = new TfvcPathFinder(childProcessMock, osMock);
        tfvcPathFinder.find().then((tfPath) => {
                assert.equal(tfPath, "tf");
                done();
            }
        );
    });

    test("should handle \"tf\" in path for linux", function (done) {
        const osMock = new OsMock("linux");
        const childProcessMock = new TfvcInPathChildProcessMock();
        const tfvcPathFinder: TfvcPathFinder = new TfvcPathFinder(childProcessMock, osMock);
        tfvcPathFinder.find().then((tfPath) => {
                assert.equal(tfPath, "tf");
                done();
            }
        );
    });

    test("should handle \"tf\" in path for darwin", function (done) {
        const osMock = new OsMock("darwin");
        const childProcessMock = new TfvcInPathChildProcessMock();
        const tfvcPathFinder: TfvcPathFinder = new TfvcPathFinder(childProcessMock, osMock);
        tfvcPathFinder.find().then((tfPath) => {
                assert.equal(tfPath, "tf");
                done();
            }
        );
    });

    test("should handle \"tf\" is not installed for win32", function (done) {
        const osMock = new OsMock("win32");
        const childProcessMock = new TfvcNotInstalledChildProcessMock();
        const tfvcPathFinder: TfvcPathFinder = new TfvcPathFinder(childProcessMock, osMock);
        tfvcPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, "tfvc command line util not found");
                done();
            }
        );
    });

    test("should handle \"tf\" is not installed for linux", function (done) {
        const osMock = new OsMock("linux");
        const childProcessMock = new TfvcNotInstalledChildProcessMock();
        const tfvcPathFinder: TfvcPathFinder = new TfvcPathFinder(childProcessMock, osMock);
        tfvcPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, "tfvc command line util not found");
                done();
            }
        );
    });

    test("should handle \"tf\" is not installed for darwin", function (done) {
        const osMock = new OsMock("darwin");
        const childProcessMock = new TfvcNotInstalledChildProcessMock();
        const tfvcPathFinder: TfvcPathFinder = new TfvcPathFinder(childProcessMock, osMock);
        tfvcPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, "tfvc command line util not found");
                done();
            }
        );
    });
});

class OsMock implements Os {
    private _platform: NodeJS.Platform;
    constructor(platform: NodeJS.Platform) {
        this._platform = platform;
    }

    homedir(): string {
        return "homedirPath";
    }

    public platform(): NodeJS.Platform {
        return this._platform;
    }
}

class TfvcInPathChildProcessMock implements AsyncChildProcess {
    exec(arg: string): Promise<any> {
        return this.handleTfInPath(arg);
    }

    handleTfInPath(arg: string): Promise<any> {
        if (arg === "\"tf\"") {
            const gitVersion = "git version 2.13.2.windows.1";
            const mockObject = {
                stdout: gitVersion
            };
            return Promise.resolve<any>(mockObject);
        } else {
            return Promise.reject<any>(undefined);
        }
    }

    spawn(...args: string[]): Promise<any> {
        return undefined;
    }
}

class TfvcNotInstalledChildProcessMock implements AsyncChildProcess {
    exec(arg: string): Promise<any> {
        return Promise.reject<any>(undefined);
    }

    spawn(...args: string[]): Promise<any> {
        return undefined;
    }
}
