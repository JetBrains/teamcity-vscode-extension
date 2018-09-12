import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });

import {anyString, anything, instance, mock, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import * as assert from "assert";
import {CvsResource} from "../../../src/bll/entities/cvsresources/cvsresource";
import * as stream from "stream";
import {AddedCvsResource} from "../../../src/bll/entities/cvsresources/addedcvsresource";
import {GetStagedFileContentStream} from "../../../src/dal/git/GetStagedFileContentStream";
import {GetStagedFileContentLength} from "../../../src/dal/git/GetStagedFileContentLength";

suite("GetStagedFileContentStream", () => {
    const workSpaceRootPath = "myWorkSpaceRootPath";
    const gitPath = "myGitPath";
    let cpMock: CpProxy;
    let cpSpy: CpProxy;
    let getStagedFileContentStreamMock: GetStagedFileContentLength;
    let getStagedFileContentStreamSpy: GetStagedFileContentLength;
    let theCommand: GetStagedFileContentStream;

    function reinitMocks() {
        cpMock = mock(CpProxy);
        cpSpy = instance(cpMock);
        getStagedFileContentStreamMock = mock(GetStagedFileContentLength);
        getStagedFileContentStreamSpy = instance(getStagedFileContentStreamMock);
        const resourceMock: CvsResource =
            new AddedCvsResource("absPath", "123", "serverPath");
        theCommand = new GetStagedFileContentStream(workSpaceRootPath,
            gitPath,
            cpSpy,
            resourceMock,
            getStagedFileContentStreamSpy);
    }

    test("should verify simple example", function (done) {
        reinitMocks();
        const testLine = "Here is any test line. Man.";
        when(getStagedFileContentStreamMock.execute()).thenReturn(Promise.resolve(testLine.length));

        const readable: any = new stream.Readable();
        when(cpMock.spawn(anyString(), anything())).thenReturn({stdout: readable});

        theCommand.execute().then((result: any) => {
            assert.deepEqual(result, {stream: readable, length: testLine.length});
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
