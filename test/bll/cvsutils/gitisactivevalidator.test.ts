"use strict";

import {assert} from "chai";
import {AsyncChildProcess} from "../../../src/bll/moduleinterfaces/asyncchildprocess";
import {GitIsActiveValidator} from "../../../src/bll/cvsutils/gitisactivevalidator";

suite("Git Is Active Validator", () => {
    test("should handle \"git\" with valid params", function (done) {
        const gitPath: string = "git";
        const childProcessMock = new ValidateGitChildProcessMock(true, true, true);
        const gitIsActiveValidator: GitIsActiveValidator = new GitIsActiveValidator(gitPath, childProcessMock);
        gitIsActiveValidator.validate().then(() => {
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle git has incorrect version", function (done) {
        const gitPath: string = "git";
        const childProcessMock = new ValidateGitChildProcessMock(false, true, true);
        const gitIsActiveValidator: GitIsActiveValidator = new GitIsActiveValidator(gitPath, childProcessMock);
        gitIsActiveValidator.validate().then(() => {
                done("Version should be incorrect");
            }
        ).catch((err: Error) => {
            assert.equal(err.message, "Git 1.13.2.windows.1 installed. TeamCity extension requires git >= 2");
            done();
        });
    });

    test("should handle not in git repo", function (done) {
        const gitPath: string = "git";
        const childProcessMock = new ValidateGitChildProcessMock(true, false, true);
        const gitIsActiveValidator: GitIsActiveValidator = new GitIsActiveValidator(gitPath, childProcessMock);
        gitIsActiveValidator.validate().then(() => {
                done("There should not be a git repo");
            }
        ).catch((err: Error) => {
            assert.equal(err.message, "Git repository was not determined");
            done();
        });
    });
});

class ValidateGitChildProcessMock implements AsyncChildProcess {
    private readonly _isVersionCorrect: boolean;
    private readonly _isGitRepo: boolean;
    private readonly _stageFilesPresent: boolean;
    constructor(isVersionCorrect: boolean, isGitRepo: boolean, stageFilesPresent: boolean) {
        this._isVersionCorrect = isVersionCorrect;
        this._isGitRepo = isGitRepo;
        this._stageFilesPresent = stageFilesPresent;
    }
    exec(arg: string): Promise<any> {
        if (arg === "\"git\" --version" && this._isVersionCorrect) {
            const mockObject: any = {
                stdout: "git version 2.13.2.windows.1"
            };
            return Promise.resolve(mockObject);
        } else if (arg === "\"git\" --version" && !this._isVersionCorrect) {
            const mockObject: any = {
                stdout: "git version 1.13.2.windows.1"
            };
            return Promise.resolve(mockObject);
        } else if (this.isGitDiffCommand(arg) && this._stageFilesPresent) {
            const mockObject: any = {
                stdout: "Not null output"
            };
            return Promise.resolve(mockObject);
        } else if (this.isGitDiffCommand(arg) && !this._stageFilesPresent) {
            const mockObject: any = {
                stdout: ""
            };
            return Promise.resolve(mockObject);
        } else if (this._isGitRepo) {
            return Promise.resolve(undefined);
        } else if (!this._isGitRepo) {
            return Promise.reject(undefined);
        }
    }

    spawn(...args: string[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    private isGitDiffCommand(command: string): boolean {
        return command.indexOf("diff") !== -1;
    }
}
