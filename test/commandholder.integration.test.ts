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
import {InMemoryCredentialsStore} from "../src/bll/credentialsstore/inmemorycredentialsstore";
import {Credentials} from "../src/bll/credentialsstore/credentials";
import {ShowMyChanges} from "../src/bll/commands/showmychanges";
import {DataProviderEnum} from "../src/bll/utils/constants";
import {ChangesProvider} from "../src/view/dataproviders/changesprovider";
import {MessageManager} from "../src/view/messagemanager";
import {BuildSettingsProvider} from "../src/view/dataproviders/BuildSettingsProvider";

suite("CommandHolder", () => {

    let mockedSignIn: SignIn;
    let signInSpy: SignIn;

    let mockedSignOut: SignOut;
    let signOutSpy: SignOut;

    let mockedSelectFilesForRemoteRun: SelectFilesForRemoteRun;
    let selectFilesForRemoteRunSpy: SelectFilesForRemoteRun;

    let mockedGetSuitableConfigs: GetSuitableConfigs;
    let getSuitableConfigsSpy: GetSuitableConfigs;

    let mockedRemoteRun: RemoteRun;
    let remoteRunSpy: RemoteRun;

    let showMyChangesMock: ShowMyChanges;
    let showMyChangesSpy: ShowMyChanges;

    let credentialsStoreMock: InMemoryCredentialsStore;
    let credentialsStoreSpy: InMemoryCredentialsStore;

    let messageManagerMock: MessageManager;
    let messageManagerSpy: MessageManager;

    let providerManagerObj: ProviderManager;
    const credsObj: Credentials =
        new Credentials("server", "user", "password", "userId", "sessionId");

    test("should verify init configuration", () => {
        reinitMocks();
        getCommandHolder();
        assert.equal(DataProviderEnum.ChangesProvider, providerManagerObj.getShownDataProvider());
    });

    test("should verify signIn success", async () => {
        reinitMocks();
        when(credentialsStoreMock.getCredentialsSilently()).thenReturn(credsObj);
        const ch: CommandHolder = getCommandHolder();

        await ch.signIn();
        tsMockito.verify(mockedSignIn.exec(anything())).called();
        verify(messageManagerMock.showErrorMessage(anything())).never();
        assert.equal(DataProviderEnum.ChangesProvider, providerManagerObj.getShownDataProvider());
    });

    test("should verify signIn failed", async () => {
        reinitMocks();
        tsMockito.when(mockedSignIn.exec(anything())).thenThrow(new Error("Any Exception"));
        const ch: CommandHolder = getCommandHolder();

        await ch.signIn();
        tsMockito.verify(mockedSignIn.exec(anything())).called();
        tsMockito.verify(messageManagerMock.showErrorMessage(anything())).called();
        assert.equal(DataProviderEnum.ChangesProvider, providerManagerObj.getShownDataProvider());
    });

    test("should verify signOut success", async () => {
        reinitMocks();
        const ch: CommandHolder = getCommandHolder();

        await ch.signOut();
        tsMockito.verify(mockedSignOut.exec()).called();
        verify(messageManagerMock.showErrorMessage(anything())).never();
        assert.equal(DataProviderEnum.ChangesProvider, providerManagerObj.getShownDataProvider());
    });

    test("should verify selectFilesForRemoteRun DO require credentials", async () => {
        reinitMocks();
        when(credentialsStoreMock.getCredentials()).thenReturn(undefined);
        const ch: CommandHolder = getCommandHolder();

        await ch.selectFilesForRemoteRun();
        tsMockito.verify(mockedSelectFilesForRemoteRun.exec()).never();
    });

    test("should verify selectFilesForRemoteRun success", async () => {
        reinitMocks();
        when(credentialsStoreMock.getCredentials()).thenReturn(Promise.resolve(credsObj));
        const ch: CommandHolder = getCommandHolder();

        await ch.selectFilesForRemoteRun();
        verify(messageManagerMock.showErrorMessage(anything())).never();
        tsMockito.verify(mockedSelectFilesForRemoteRun.exec()).called();
});

    test("should verify selectFilesForRemoteRun failed", async () => {
        reinitMocks();
        tsMockito.when(mockedSelectFilesForRemoteRun.exec()).thenThrow(new Error("Any Exception"));
        when(credentialsStoreMock.getCredentials()).thenReturn(Promise.resolve(credsObj));
        const ch = getCommandHolder();

        await ch.selectFilesForRemoteRun();
        tsMockito.verify(mockedSelectFilesForRemoteRun.exec()).called();
        verify(messageManagerMock.showErrorMessage(anything())).called();
        assert.equal(DataProviderEnum.ChangesProvider, providerManagerObj.getShownDataProvider());
    });

    test("should verify getSuitableConfigs success", async () => {
        reinitMocks();
        const ch = getCommandHolder();
        providerManagerObj.showResourceProvider();
        assert.equal(DataProviderEnum.ResourcesProvider, providerManagerObj.getShownDataProvider());

        await ch.getSuitableConfigs();
        verify(messageManagerMock.showErrorMessage(anything())).never();
        tsMockito.verify(mockedGetSuitableConfigs.exec()).called();
        assert.equal(DataProviderEnum.BuildsProvider, providerManagerObj.getShownDataProvider());
    });

    test("should verify getSuitableConfigs failed", async () => {
        reinitMocks();
        tsMockito.when(mockedGetSuitableConfigs.exec()).thenThrow(new Error("Any Exception"));
        const ch = getCommandHolder();
        providerManagerObj.showResourceProvider();
        assert.equal(DataProviderEnum.ResourcesProvider, providerManagerObj.getShownDataProvider());

        await ch.getSuitableConfigs();
        verify(messageManagerMock.showErrorMessage(anything())).called();
        tsMockito.verify(mockedGetSuitableConfigs.exec()).called();
        assert.equal(DataProviderEnum.ResourcesProvider, providerManagerObj.getShownDataProvider());
    });

    test("should verify remoteRun success", async () => {
        reinitMocks();
        const ch = getCommandHolder();
        providerManagerObj.showBuildProvider();

        await ch.remoteRunWithChosenConfigs();
        verify(messageManagerMock.showErrorMessage(anything())).never();
        tsMockito.verify(mockedRemoteRun.exec(anything())).called();
    });

    test("should verify preTestedCommit success", async () => {
        reinitMocks();
        const ch = getCommandHolder();
        providerManagerObj.showBuildProvider();
        assert.equal(DataProviderEnum.BuildsProvider, providerManagerObj.getShownDataProvider());

        await ch.preTestedCommit();
        verify(messageManagerMock.showErrorMessage(anything())).never();
        tsMockito.verify(mockedRemoteRun.exec(anything())).called();
    });

    test("should verify remoteRun failed", async () => {
        reinitMocks();
        tsMockito.when(mockedRemoteRun.exec(anything())).thenThrow(new Error("Any Exception"));
        const ch = getCommandHolder();

        providerManagerObj.showBuildProvider();
        assert.equal(DataProviderEnum.BuildsProvider, providerManagerObj.getShownDataProvider());

        await ch.remoteRunWithChosenConfigs();
        verify(messageManagerMock.showErrorMessage(anything())).called();
        tsMockito.verify(mockedRemoteRun.exec(anything())).called();
    });

    test("should verify showMyChanges success", async () => {
        reinitMocks();
        when(showMyChangesMock.exec()).thenReturn(Promise.resolve());
        when(showMyChangesMock.exec(anything())).thenReturn(Promise.resolve());
        const ch = getCommandHolder();
        assert.equal(DataProviderEnum.ChangesProvider, providerManagerObj.getShownDataProvider());

        await ch.showMyChanges();
        verify(showMyChangesMock.exec(anything())).called();
        verify(messageManagerMock.showErrorMessage(anything())).never();
        assert.equal(DataProviderEnum.ChangesProvider, providerManagerObj.getShownDataProvider());
    });

    function getCommandHolder() {
        return new CommandHolder(signInSpy,
            signOutSpy,
            selectFilesForRemoteRunSpy,
            getSuitableConfigsSpy,
            remoteRunSpy,
            showMyChangesSpy,
            providerManagerObj,
            credentialsStoreSpy,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            messageManagerSpy);
    }

    function reinitMocks() {
        mockedSignIn = tsMockito.mock(SignIn);
        signInSpy = tsMockito.instance(mockedSignIn);

        mockedSignOut = tsMockito.mock(SignOut);
        signOutSpy = tsMockito.instance(mockedSignOut);

        mockedSelectFilesForRemoteRun = tsMockito.mock(SelectFilesForRemoteRun);
        selectFilesForRemoteRunSpy = tsMockito.instance(mockedSelectFilesForRemoteRun);

        mockedGetSuitableConfigs = tsMockito.mock(GetSuitableConfigs);
        getSuitableConfigsSpy = tsMockito.instance(mockedGetSuitableConfigs);

        mockedRemoteRun = tsMockito.mock(RemoteRun);
        remoteRunSpy = tsMockito.instance(mockedRemoteRun);

        showMyChangesMock = tsMockito.mock(ShowMyChanges);
        showMyChangesSpy = tsMockito.instance(showMyChangesMock);

        messageManagerMock = tsMockito.mock(MessageManager);
        messageManagerSpy = tsMockito.instance(messageManagerMock);

        credentialsStoreMock = tsMockito.mock(InMemoryCredentialsStore);
        credentialsStoreSpy = tsMockito.instance(credentialsStoreMock);

        providerManagerObj = new ProviderManager(new ResourceProvider(),
            new BuildProvider(),
            new ChangesProvider(),
            new BuildSettingsProvider());
    }
});
