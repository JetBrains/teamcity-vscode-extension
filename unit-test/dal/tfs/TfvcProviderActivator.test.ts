import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", {});

import {anyFunction, anyString, instance, mock, verify, when} from "ts-mockito";
import {CpProxy} from "../../../src/bll/moduleproxies/cp-proxy";
import * as assert from "assert";
import {TfvcProviderActivator} from "../../../src/dal/tfs/TfvcProviderActivator";
import {TfvcPathFinder} from "../../../src/bll/cvsutils/tfvcpathfinder";
import {TfvcIsActiveValidator} from "../../../src/bll/cvsutils/tfvcisactivevalidator";
import {UriProxy} from "../../../src/bll/moduleproxies/uri-proxy";
import {TfvcProvider} from "../../../src/dal/tfs/TfsProvider";
import {TfvcCommandFactory} from "../../../src/dal/tfs/TfvcCommandFactory";
import {ITfsWorkFoldInfo} from "../../../src/dal/tfs/ITfsWorkFoldInfo";

suite("TfvcProviderActivator", () => {
    const tfWorkFoldResultExample: { stdout: string } = {
        stdout: "===============================================================================\n" +
            "Workspace : UNIT-239 (rugpanov)\n" +
            "Collection: https://someproject.visualstudio.com/\n" +
            " $/MyFirstProject/App1/App1: C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1\n"
    };
    const testTfInfo: ITfsWorkFoldInfo = {
        repositoryUrl: "https://someproject.visualstudio.com/",
        collectionName: "someproject",
        projectRemotePath: "$/MyFirstProject/App1/App1",
        projectLocalPath: "C:\\Users\\user\\Source\\Workspaces\\MyFirstProject\\App1\\App1"
    };
    const testTfPath: string = "testTf/Path";
    const testWorkSpacePath: string = "testWorkspace/Path";
    const fakeUri: UriProxy = {fsPath: testWorkSpacePath, path: testWorkSpacePath, file: anyFunction};

    let cpMock: CpProxy;
    let cpSpy: CpProxy;
    let tfvcPathFinderMock: TfvcPathFinder;
    let tfvcIsActiveValidatorMock: TfvcIsActiveValidator;
    let theActivator: TfvcProviderActivator;

    function initMocks() {
        cpMock = mock(CpProxy);
        when(cpMock.execAsync(anyString())).thenReturn(Promise.resolve(tfWorkFoldResultExample));
        cpSpy = instance(cpMock);
        tfvcPathFinderMock = mock(TfvcPathFinder);
        when(tfvcPathFinderMock.find()).thenReturn(Promise.resolve(testTfPath));
        tfvcIsActiveValidatorMock = mock(TfvcIsActiveValidator);
        when(tfvcIsActiveValidatorMock.validate(testWorkSpacePath, testTfPath)).thenReturn(Promise.resolve());
        theActivator = new TfvcProviderActivator(
            cpSpy,
            instance(tfvcPathFinderMock),
            instance(tfvcIsActiveValidatorMock));
    }

    test("should verify tf not found", function (done) {
        initMocks();
        when(tfvcPathFinderMock.find()).thenReturn(Promise.reject("tfvc command line util not found"));

        theActivator.tryActivateInPath(fakeUri).then((results: TfvcProvider) => {
            assert.equal(results, undefined);
            verify(cpMock.execAsync(anyString())).never();
            verify(tfvcIsActiveValidatorMock.validate(anyString(), anyString())).never();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify validation error occurs", function (done) {
        initMocks();
        when(tfvcIsActiveValidatorMock.validate(testWorkSpacePath, testTfPath))
            .thenReturn(Promise.reject("any reason"));

        theActivator.tryActivateInPath(fakeUri).then((results: TfvcProvider) => {
            assert.equal(results, undefined);
            verify(cpMock.execAsync(anyString())).never();
            verify(tfvcIsActiveValidatorMock.validate(anyString(), anyString())).called();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify tfInfo not received", function (done) {
        initMocks();
        when(cpMock.execAsync(anyString())).thenReject("any reason");

        theActivator.tryActivateInPath(fakeUri).then((results: TfvcProvider) => {
            assert.equal(results, undefined);
            verify(cpMock.execAsync(anyString())).called();
            verify(tfvcIsActiveValidatorMock.validate(anyString(), anyString())).called();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify tfvc repository case", function (done) {
        initMocks();

        theActivator.tryActivateInPath(fakeUri).then((results: TfvcProvider) => {
            const newTfvcCommandFactory: TfvcCommandFactory = new TfvcCommandFactory(testWorkSpacePath,
                testTfPath,
                testTfInfo,
                cpSpy);
            const newTfvcProvider: TfvcProvider = new TfvcProvider(testWorkSpacePath, newTfvcCommandFactory);
            assert.deepEqual(results, newTfvcProvider);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});
