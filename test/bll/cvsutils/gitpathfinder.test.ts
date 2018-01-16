"use strict";

import {assert} from "chai";
import * as path from "path";
import {GitPathFinder} from "../../../src/bll/cvsutils/gitpathfinder";
import {AsyncChildProcess} from "../../../src/bll/moduleinterfaces/asyncchildprocess";
import {MessageConstants} from "../../../src/bll/utils/messageconstants";
import {anyString, instance, mock, when} from "ts-mockito";
import {FsProxy} from "../../../src/bll/moduleproxies/fs-proxy";
import {ProcessProxy} from "../../../src/bll/moduleproxies/process-proxy";

suite("Git Path Finder", () => {
    test("should handle \"git\" path for win32", function (done) {
        const processMock = getSettedUpProcessSpy("win32");
        const childProcessMock = new GitInPathChildProcessMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, "git");
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" path for linux", function (done) {
        const processMock = getSettedUpProcessSpy("linux");
        const childProcessMock = new GitInPathChildProcessMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, "git");
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" path for macOS", function (done) {
        const processMock = getSettedUpProcessSpy("darwin");
        const childProcessMock = new GitInPathChildProcessMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, "git");
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" in the \"ProgramFiles/Git/cmd\" for win32", function (done) {
        const processMock = getSettedUpProcessSpy("win32");
        const childProcessMock = new GitInProgramFilesFolderChildProcessMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, path.join("ProgramFilesPath", "Git", "cmd", "git.exe"));
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" in the \"PortableGitFolder\" for win32", function (done) {
        const processMock = getSettedUpProcessSpy("win32");
        const childProcessMock = new GitInGitHubFolderChildProcessMock();

        const fsMock = mock(FsProxy);
        when(fsMock.readdirAsync(anyString())).thenReturn(Promise.resolve(["PortableGitFolder"]));
        const fsSpy = instance(fsMock);

        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock, fsSpy);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, path.join("LOCALAPPDATAPath", "GitHub", "PortableGitFolder", "cmd", "git.exe"));
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" is not installed for win32", function (done) {
        const processMock = getSettedUpProcessSpy("win32");
        const childProcessMock = new GitIsNotInstalledChildProcessMock();

        const fsMock = mock(FsProxy);
        when(fsMock.readdirAsync(anyString())).thenReturn(Promise.resolve(["PortableGitFolder"]));
        const fsSpy = instance(fsMock);

        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock, fsSpy);
        gitPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, "Git path is not found!");
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" is not installed for linux", function (done) {
        const processMock = getSettedUpProcessSpy("linux");
        const childProcessMock = new GitIsNotInstalledChildProcessMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, "Git path is not found!");
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" is not installed for darwin", function (done) {
        const processMock = getSettedUpProcessSpy("darwin");
        const childProcessMock = new GitIsNotInstalledChildProcessMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, "Git path is not found!");
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" in the \"/usr/bin/\" for linux with xcode-select installed", function (done) {
        const processMock = getSettedUpProcessSpy("darwin");
        const xcodeSelectInstalled = true;
        const childProcessMock = new GitInUserBinChildProcessMock(xcodeSelectInstalled);
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, "/usr/bin/git");
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

    test("should handle \"git\" in the \"/usr/bin/\" for linux without xcode-select installed", function (done) {
        const processMock = getSettedUpProcessSpy("darwin");
        const xcodeSelectInstalled = false;
        const childProcessMock = new GitInUserBinChildProcessMock(xcodeSelectInstalled);
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, MessageConstants.GIT_PATH_IS_NOT_FOUND);
                done();
            }
        ).catch((err) => {
            done(err);
        });
    });

});

function getSettedUpProcessSpy(platform: NodeJS.Platform): ProcessProxy {
    const processMock = mock(ProcessProxy);
    when(processMock.platform).thenReturn(platform);
    const envArgs = [];
    envArgs["ProgramW6432"] = "ProgramW6432Path";
    envArgs["ProgramFiles(x86)"] = "ProgramFiles(x86)Path";
    envArgs["ProgramFiles"] = "ProgramFilesPath";
    envArgs["LOCALAPPDATA"] = "LOCALAPPDATAPath";
    when(processMock.env).thenReturn(envArgs);
    return instance(processMock);
}

class GitInPathChildProcessMock implements AsyncChildProcess {
    exec(arg: string): Promise<any> {
        return this.handleDarwinWhichGit(arg)
            .then(void 0, () => this.handleGitInPath(arg));
    }

    handleGitInPath(arg: string): Promise<any> {
        if (arg === "\"git\" --version") {
            const gitVersion = "git version 2.13.2.windows.1";
            const mockObject = {
                stdout: gitVersion
            };
            return Promise.resolve<any>(mockObject);
        } else {
            return Promise.reject<any>(undefined);
        }
    }

    handleDarwinWhichGit(arg: string): Promise<any> {
        if (arg === "which git") {
            const mockObject = {
                stdout: "git"
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

class GitInProgramFilesFolderChildProcessMock implements AsyncChildProcess {
    exec(arg: string): Promise<any> {
        return this.handleGinInProgramFiles(arg);
    }

    handleGinInProgramFiles(arg: string): Promise<any> {
        const expectedPath = `"${path.join("ProgramFilesPath", "Git", "cmd", "git.exe")}" --version`;
        if (arg === expectedPath) {
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

class GitInGitHubFolderChildProcessMock implements AsyncChildProcess {
    exec(arg: string): Promise<any> {
        return this.handleGinInProgramFiles(arg);
    }

    handleGinInProgramFiles(arg: string): Promise<any> {
        const expectedPath = `"${path.join("LOCALAPPDATAPath", "GitHub", "PortableGitFolder", "cmd", "git.exe")}" --version`;
        if (arg === expectedPath) {
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

class GitInUserBinChildProcessMock implements AsyncChildProcess {

    private readonly xcodeSelectInstalled : boolean;
    constructor(xcodeSelectInstalled: boolean = true) {
        this.xcodeSelectInstalled = xcodeSelectInstalled;
    }

    exec(arg: string): Promise<any> {
        return this.handleDarwinWhichGit(arg)
            .then(void 0, () => this.handleGitInPath(arg))
            .then(void 0, () => this.handleDirrectoryCheck(arg));
    }

    handleGitInPath(arg: string): Promise<any> {
        if (arg === "\"/usr/bin/git\" --version") {
            const gitVersion = "git version 2.13.2.windows.1";
            const mockObject = {
                stdout: gitVersion
            };
            return Promise.resolve<any>(mockObject);
        } else {
            return Promise.reject<any>(undefined);
        }
    }

    handleDarwinWhichGit(arg: string): Promise<any> {
        if (arg === "which git") {
            const mockObject = {
                stdout: "/usr/bin/git"
            };
            return Promise.resolve<any>(mockObject);
        } else {
            return Promise.reject<any>(undefined);
        }
    }

    handleDirrectoryCheck(arg: string): Promise<any> {
        if (arg === "xcode-select -p" && this.xcodeSelectInstalled) {
            return Promise.resolve<any>(undefined);
        } else if (arg === "xcode-select -p" && !this.xcodeSelectInstalled) {
            const err: any = {
                code: 2
            };
            return Promise.reject<any>(err);
        } else {
            return Promise.reject<any>(undefined);
        }
    }

    spawn(...args: string[]): Promise<any> {
        return undefined;
    }
}

class GitIsNotInstalledChildProcessMock implements AsyncChildProcess {
    exec(arg: string): Promise<any> {
        return Promise.reject<any>(undefined);
    }

    spawn(...args: string[]): Promise<any> {
        return undefined;
    }
}
