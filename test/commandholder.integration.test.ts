import * as tsMockito from "ts-mockito";
import {anything, verify, when} from "ts-mockito";
import {assert} from "chai";
import {ProviderManager} from "../src/view/providermanager";
import {CommandHolder} from "../src/commandholder";
import {SelectFilesForRemoteRun} from "../src/bll/commands/selectfilesforremoterun";
import {GetSuitableConfigs} from "../src/bll/commands/getsuitableconfigs";
import {RemoteRun} from "../src/bll/commands/remoterun";
import {SignIn} from "../src/bll/commands/signin";
import {SignOut} from "../src/bll/commands/signout";
import {ResourceProvider} from "../src/view/dataproviders/resourceprovider";
import {BuildProvider} from "../src/view/dataproviders/buildprovider";
import {CredentialsStore} from "../src/bll/credentialsstore/credentialsstore";
import {InMemoryCredentialsStore} from "../src/bll/credentialsstore/inmemorycredentialsstore";
import {Credentials} from "../src/bll/credentialsstore/credentials";
import {ShowMyChanges} from "../src/bll/commands/showmychanges";
import {DataProviderEnum} from "../src/bll/utils/constants";
import {ChangesProvider} from "../src/view/dataproviders/changesprovider";
import {MessageManager} from "../src/view/messagemanager";

suite("DataProviders", () => {
    test("should verify signIn success", function (done) {
        const mockedSignIn: SignIn = tsMockito.mock(SignIn);
        const signInSpy: SignIn = tsMockito.instance(mockedSignIn);

        const credentialsStoreMock: CredentialsStore = tsMockito.mock(InMemoryCredentialsStore);
        when(credentialsStoreMock.getCredentialsSilently()).thenReturn(new Credentials("server", "user", "password", "userId", "sessionId"));
        const credentialsStoreSpy: CredentialsStore = tsMockito.instance(credentialsStoreMock);

        const dp = prepareProviderManager();
        assert.isUndefined(dp.getShownDataProvider());

        const ch = new CommandHolder(undefined, signInSpy, undefined, undefined,
                                     undefined, undefined, undefined, dp, credentialsStoreSpy);
        ch.signIn().then(() => {
            tsMockito.verify(mockedSignIn.exec(anything())).called();
            assert.equal(dp.getShownDataProvider(), DataProviderEnum.EmptyDataProvider, "EmptyDataProvider should be shown");
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify signIn failed", function (done) {
        const mockedSignIn: SignIn = tsMockito.mock(SignIn);
        tsMockito.when(mockedSignIn.exec(anything())).thenThrow(new Error("Any Exception"));
        const signInSpy: SignIn = tsMockito.instance(mockedSignIn);
        const dp = prepareProviderManager();
        assert.isUndefined(dp.getShownDataProvider());
        const ch = new CommandHolder(undefined, signInSpy, undefined, undefined, undefined, undefined, undefined, dp);

        ch.signIn().then(() => {
            done("Expected an exception");
        }).catch(() => {
            tsMockito.verify(mockedSignIn.exec(anything())).called();
            assert.isUndefined(dp.getShownDataProvider(), "DataProviders should be hidden");
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify signOut success", function (done) {
        const mockedSignOut: SignOut = tsMockito.mock(SignOut);
        const signOutSpy: SignOut = tsMockito.instance(mockedSignOut);
        const dp = prepareProviderManager();
        dp.showResourceProvider();
        assert.notEqual(dp.getShownDataProvider, undefined);
        const ch = new CommandHolder(undefined, undefined, signOutSpy, undefined, undefined, undefined, undefined, dp);

        ch.signOut().then(() => {
            tsMockito.verify(mockedSignOut.exec()).called();
            assert.isUndefined(dp.getShownDataProvider(), "DataProviders should be hidden");
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify selectFilesForRemoteRun success", function (done) {
        const mockedSelectFilesForRemoteRun: SelectFilesForRemoteRun = tsMockito.mock(SelectFilesForRemoteRun);
        const selectFilesForRemoteRunSpy: SelectFilesForRemoteRun = tsMockito.instance(mockedSelectFilesForRemoteRun);
        const dp = prepareProviderManager();
        dp.showEmptyDataProvider();
        assert.equal(dp.getShownDataProvider(), DataProviderEnum.EmptyDataProvider, "EmptyDataProvider should be shown");
        const ch = new CommandHolder(undefined, undefined, undefined, selectFilesForRemoteRunSpy, undefined, undefined, undefined, dp);

        ch.selectFilesForRemoteRun().then(() => {
            tsMockito.verify(mockedSelectFilesForRemoteRun.exec()).called();
            assert.equal(dp.getShownDataProvider(), DataProviderEnum.ResourcesProvider, "ResourcesProvider should be shown");
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify selectFilesForRemoteRun failed", function (done) {
        const mockedSelectFilesForRemoteRun: SelectFilesForRemoteRun = tsMockito.mock(SelectFilesForRemoteRun);
        tsMockito.when(mockedSelectFilesForRemoteRun.exec(anything())).thenThrow(new Error("Any Exception"));
        const selectFilesForRemoteRunSpy: SelectFilesForRemoteRun = tsMockito.instance(mockedSelectFilesForRemoteRun);
        const dp = prepareProviderManager();
        dp.showEmptyDataProvider();

        const messageManagerMock: MessageManager = tsMockito.mock(MessageManager);
        const messageManagerSpy: MessageManager = tsMockito.instance(messageManagerMock);
        const ch = new CommandHolder(undefined, undefined, undefined, selectFilesForRemoteRunSpy,
                                     undefined, undefined, undefined, dp, undefined,
                                     undefined, undefined, undefined, messageManagerSpy);

        ch.selectFilesForRemoteRun().then(() => {
            verify(messageManagerMock.showErrorMessage(anything())).called();
            tsMockito.verify(mockedSelectFilesForRemoteRun.exec()).called();
            assert.equal(dp.getShownDataProvider(), DataProviderEnum.EmptyDataProvider, "EmptyDataProvider should be shown");
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify getSuitableConfigs success", function (done) {
        const mockedGetSuitableConfigs: GetSuitableConfigs = tsMockito.mock(GetSuitableConfigs);
        const getSuitableConfigsSpy: GetSuitableConfigs = tsMockito.instance(mockedGetSuitableConfigs);
        const dp = prepareProviderManager();

        const ch = new CommandHolder(undefined, undefined, undefined, undefined, getSuitableConfigsSpy, undefined, undefined, dp);
        ch.getSuitableConfigs().then(() => {
            tsMockito.verify(mockedGetSuitableConfigs.exec()).called();
            assert.equal(dp.getShownDataProvider(), DataProviderEnum.BuildsProvider, "BuildsProvider should be shown");
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify getSuitableConfigs failed", function (done) {
        const mockedGetSuitableConfigs: GetSuitableConfigs = tsMockito.mock(GetSuitableConfigs);
        tsMockito.when(mockedGetSuitableConfigs.exec(anything())).thenThrow(new Error("Any Exception"));
        const getSuitableConfigsSpy: GetSuitableConfigs = tsMockito.instance(mockedGetSuitableConfigs);
        const dp = prepareProviderManager();
        dp.showResourceProvider();

        const messageManagerMock: MessageManager = tsMockito.mock(MessageManager);
        const messageManagerSpy: MessageManager = tsMockito.instance(messageManagerMock);

        const ch = new CommandHolder(undefined, undefined, undefined, undefined,
                                     getSuitableConfigsSpy, undefined, undefined, dp, undefined,
                                     undefined, undefined, undefined, messageManagerSpy);
        assert.equal(dp.getShownDataProvider(), DataProviderEnum.ResourcesProvider, "ResourcesProvider should be shown");

        ch.getSuitableConfigs().then(() => {
            verify(messageManagerMock.showErrorMessage(anything())).called();
            tsMockito.verify(mockedGetSuitableConfigs.exec(anything())).called();
            assert.equal(dp.getShownDataProvider(), DataProviderEnum.ResourcesProvider, "ResourcesProvider should be shown");
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify remoteRun success", function (done) {
        const mockedRemoteRun: RemoteRun = tsMockito.mock(RemoteRun);
        const remoteRunSpy: RemoteRun = tsMockito.instance(mockedRemoteRun);
        const dp = prepareProviderManager();
        dp.showBuildProvider();
        const ch = new CommandHolder(undefined, undefined, undefined, undefined, undefined, remoteRunSpy, undefined, dp);
        assert.equal(dp.getShownDataProvider(), DataProviderEnum.BuildsProvider, "BuildsProvider should be shown");

        ch.remoteRunWithChosenConfigs().then(() => {
            tsMockito.verify(mockedRemoteRun.exec()).called();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify remoteRun failed", function (done) {
        const mockedRemoteRun: RemoteRun = tsMockito.mock(RemoteRun);
        tsMockito.when(mockedRemoteRun.exec(anything())).thenThrow(new Error("Any Exception"));
        const remoteRunSpy: RemoteRun = tsMockito.instance(mockedRemoteRun);
        const dp = prepareProviderManager();
        dp.showBuildProvider();

        const messageManagerMock: MessageManager = tsMockito.mock(MessageManager);
        const messageManagerSpy: MessageManager = tsMockito.instance(messageManagerMock);

        const ch = new CommandHolder(undefined, undefined, undefined, undefined,
                                     undefined, remoteRunSpy, undefined, dp, undefined,
                                     undefined, undefined, undefined, messageManagerSpy);
        assert.equal(dp.getShownDataProvider(), DataProviderEnum.BuildsProvider, "BuildsProvider should be shown");

        ch.remoteRunWithChosenConfigs().then(() => {
            verify(messageManagerMock.showErrorMessage(anything())).called();
            tsMockito.verify(mockedRemoteRun.exec(anything())).called();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify showMyChanges", function (done) {
        const showMyChangesMock: ShowMyChanges = tsMockito.mock(ShowMyChanges);
        when(showMyChangesMock.exec()).thenReturn(Promise.resolve());
        const showMyChangesSpy: ShowMyChanges = tsMockito.instance(showMyChangesMock);
        const dp = prepareProviderManager();
        const ch = new CommandHolder(undefined, undefined, undefined, undefined, undefined, undefined, showMyChangesSpy, dp);
        ch.showMyChanges().then(() => {
            verify(showMyChangesMock.exec()).called();
            assert.equal(dp.getShownDataProvider(), DataProviderEnum.ChangesProvider, "ChangesProvider should be shown");
            done();
        }).catch((err) => {
            done(err);
        });
    });

    function prepareProviderManager(): ProviderManager {
        return new ProviderManager(new ResourceProvider(), new BuildProvider(), new ChangesProvider());
    }
});
