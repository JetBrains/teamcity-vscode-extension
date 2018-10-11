import "reflect-metadata";
import {anyString, instance, mock, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import {ITfsWorkFoldInfo} from "../../../src/dal/tfs/ITfsWorkFoldInfo";
import {BriefDiffRowsParser} from "../../../src/dal/tfs/BriefDiffRowsParser";
import {GetPrevResourceName} from "../../../src/dal/tfs/GetPrevResourceName";
import {CvsResource} from "../../../src/bll/entities/cvsresources/cvsresource";
import * as assert from "assert";
import {DeletedCvsResource} from "../../../src/bll/entities/cvsresources/deletedcvsresource";
import {ModifiedCvsResource} from "../../../src/bll/entities/cvsresources/modifiedcvsresource";
import {ReplacedCvsResource} from "../../../src/bll/entities/cvsresources/replacedcvsresource";

const rmock = require("mock-require");
rmock("vscode", {});

suite("BriefDiffRowsParser", () => {
    const testTfPath: string = "testTf/Path";
    const testTfInfo: ITfsWorkFoldInfo = {
        repositoryUrl: "https://someproject.visualstudio.com/",
        collectionName: "someproject",
        projectRemotePath: "$/MyFirstProject/App1/App1",
        projectLocalPath: "C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1"
    };
    const testPrevPath = "C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1\\App.xaml";

    const commandInputExample: string =
        "delete: C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1\\App.xaml.cs\n" +
        "C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1\\App.xaml.cs: files differ\n" +
        "edit: C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1\\App1.csproj\n" +
        "rename: C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1\\App1.xaml";
    const GOLD: CvsResource[] = [
        new DeletedCvsResource(
            "C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1\\App.xaml.cs",
            "App.xaml.cs",
            "tfs://https://someproject.visualstudio.com/$/MyFirstProject/App1/App1/App.xaml.cs"),
        new ModifiedCvsResource(
            "C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1\\App1.csproj",
            "App1.csproj",
            "tfs://https://someproject.visualstudio.com/$/MyFirstProject/App1/App1/App1.csproj"),
        new ReplacedCvsResource(
            "C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1\\App1.xaml",
            "App1.xaml",
            "tfs://https://someproject.visualstudio.com/$/MyFirstProject/App1/App1/App1.xaml",
            "C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1\\App.xaml",
            "tfs://https://someproject.visualstudio.com/$/MyFirstProject/App1/App1/App.xaml")];
    let cpMock: CpProxy;
    let cpSpy: CpProxy;
    let getPrevResourceNameMock: GetPrevResourceName;
    let theCommand: BriefDiffRowsParser;

    function initMocks() {
        cpMock = mock(CpProxy);
        getPrevResourceNameMock = mock(GetPrevResourceName);
        when(getPrevResourceNameMock.execute(anyString())).thenReturn(Promise.resolve(testPrevPath));
        cpSpy = instance(cpMock);
        theCommand = new BriefDiffRowsParser(testTfPath,
            testTfInfo,
            instance(getPrevResourceNameMock));
    }

    test("should verify command example success", function (done) {
        initMocks();
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve());

        theCommand.tryParseRows(commandInputExample).then((result: CvsResource[]) => {
            assert.deepStrictEqual(result, GOLD);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
