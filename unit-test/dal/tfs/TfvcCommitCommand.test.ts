import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", {});

import {anyOfClass, anyString, instance, mock, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import {TfvcCommitCommand} from "../../../src/dal/tfs/TfvcCommitCommand";
import {CheckInInfo} from "../../../src/bll/entities/checkininfo";
import {GitProvider} from "../../../src/dal/git/GitProvider";

suite("TfvcCommitCommand", () => {
    const testTfPath: string = "testTf/Path";
    let cpMock: CpProxy;
    let cpSpy: CpProxy;
    let theCommand: TfvcCommitCommand;

    function initMocks() {
        cpMock = mock(CpProxy);
        cpSpy = instance(cpMock);
        const checkInInfo: CheckInInfo =
            new CheckInInfo([], anyOfClass(GitProvider), anyString());
        theCommand = new TfvcCommitCommand(testTfPath, cpSpy, checkInInfo);
    }

    test("should verify commit success", function (done) {
        initMocks();
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve());
        theCommand.execute().then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify commit failed", function (done) {
        initMocks();
        when(cpMock.execAsync(anyString())).thenReject("any reason");
        theCommand.execute().then(() => {
            done("not ok");
        }).catch(() => {
            done();
        });
    });
});
