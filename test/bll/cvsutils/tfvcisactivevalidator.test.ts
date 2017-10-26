"use strict";
import {AsyncChildProcess} from "../../../src/bll/moduleinterfaces/asyncchildprocess";
import {TfvcIsActiveValidator} from "../../../src/bll/cvsutils/tfvcisactivevalidator";

suite("Tfvc Is Active Validator", () => {
    test("should handle \"tf\" with valid params", function (done) {
        const tfvcPath: string = "tf";
        const childProcessMock = new ValidateGitChildProcessMock(true, true);
        const tfvcIsActiveValidator: TfvcIsActiveValidator = new TfvcIsActiveValidator(tfvcPath, childProcessMock);
        tfvcIsActiveValidator.validate().then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should handle not tfvc repo", function (done) {
        const tfvcPath: string = "tf";
        const childProcessMock = new ValidateGitChildProcessMock(false, true);
        const tfvcIsActiveValidator: TfvcIsActiveValidator = new TfvcIsActiveValidator(tfvcPath, childProcessMock);
        tfvcIsActiveValidator.validate().then(() => {
            done("Should not be tfvc repo");
        }).catch((err: Error) => {
            if (err.message, "Tfs repository was not determined") {
                done();
            } else {
                done("unexpected error message");
            }
        });
    });
});

class ValidateGitChildProcessMock implements AsyncChildProcess {
    private readonly _isTfvcRepo: boolean;
    private readonly _changedFilesPresent: boolean;
    private execCallCounter = 0;
    constructor(isTfvcRepo: boolean, changedFilesPresent: boolean) {
        this._isTfvcRepo = isTfvcRepo;
        this._changedFilesPresent = changedFilesPresent;
    }

    exec(arg: string): Promise<any> {
        this.execCallCounter++;
        if (this._isTfvcRepo && this.execCallCounter === 1) {
            const mockObject: any = {
                stdout: "Not null output"
            };
            return Promise.resolve(mockObject);
        } else if (!this._isTfvcRepo && this.execCallCounter === 1) {
            return Promise.reject(undefined);
        } else if (this.isDiffCommand(arg) && this._changedFilesPresent) {
            const mockObject: any = {
                stdout: "Not null output"
            };
            return Promise.resolve(mockObject);
        } else if (this.isDiffCommand(arg) && !this._changedFilesPresent) {
            const mockObject: any = {
                stdout: ""
            };
            return Promise.resolve(mockObject);
        } else {
            return Promise.reject(undefined);
        }
    }

    spawn(...args: string[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    private isDiffCommand(command: string): boolean {
        return command.indexOf("diff") !== -1;
    }
}
