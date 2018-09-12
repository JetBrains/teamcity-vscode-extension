import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });

import {anyString, anything, instance, mock, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import * as assert from "assert";
import {GetStagedFileContentLength} from "../../../src/dal/git/GetStagedFileContentLength";
import {CvsResource} from "../../../src/bll/entities/cvsresources/cvsresource";
import * as stream from "stream";
import {AddedCvsResource} from "../../../src/bll/entities/cvsresources/addedcvsresource";

suite("GetStagedFileContentLength", () => {
    const workSpaceRootPath = "myWorkSpaceRootPath";
    const gitPath = "myGitPath";
    let cpMock: CpProxy;
    let cpSpy: CpProxy;
    let theCommand: GetStagedFileContentLength;

    function reinitMocks() {
        cpMock = mock(CpProxy);
        cpSpy = instance(cpMock);
        const resourceMock: CvsResource =
            new AddedCvsResource("absPath", "123", "serverPath");
        theCommand = new GetStagedFileContentLength(workSpaceRootPath, gitPath, resourceMock, cpSpy);
    }

    test("should verify simple example", function (done) {
        reinitMocks();
        const testLine = "Here is any test line. Man.";

        const readable: any = new stream.Readable();
        readable.push(testLine);
        when(cpMock.spawn(anyString(), anything())).thenReturn({stdout: readable});
        //tslint:disable-next-line: no-null-keyword
        readable.push(null);

        theCommand.execute().then((result: number) => {
            assert.equal(result, testLine.length);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
