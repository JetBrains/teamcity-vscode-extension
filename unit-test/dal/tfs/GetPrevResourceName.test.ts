import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", {});

import {anything, instance, mock, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import {GetPrevResourceName} from "../../../src/dal/tfs/GetPrevResourceName";
import {ITfsWorkFoldInfo} from "../../../src/dal/tfs/ITfsWorkFoldInfo";
import * as assert from "assert";

suite("GetPrevResourceName", () => {
    const testTfPath: string = "testTf/Path";

    const testTfInfo: ITfsWorkFoldInfo = {
        repositoryUrl: "https://someproject.visualstudio.com/",
        collectionName: "someproject",
        projectRemotePath: "$/MyFirstProject/App1/App1",
        projectLocalPath: "C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1"
    };
    let cpMock: CpProxy;
    let cpSpy: CpProxy;
    let theCommand: GetPrevResourceName;
    const testFileAbsPath: string =
        "-------------------------------------------------------------------------------\n" +
        "Changeset: 42\n" +
        "User: rugpanov\n" +
        "Date: Friday, June 15, 2018 12:06:55 PM" +
        "\nComment:\n\n" +
        "    Items:\n" +
        "        edit $/MyFirstProject/App1/App1/App.xaml\n\n\n";

    function initMocks() {
        cpMock = mock(CpProxy);
        cpSpy = instance(cpMock);
        theCommand = new GetPrevResourceName(
            testTfPath,
            testTfInfo,
            cpSpy);
    }

    test("should verify command of", function (done) {
        initMocks();
        when(cpMock.execAsync(anything())).thenReturn(Promise.resolve({stdout: testFileAbsPath}));

        theCommand.execute("fileAbsPath").then((result: string) => {
            assert(result, "$/MyFirstProject/App1/App1/App.xaml");
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
