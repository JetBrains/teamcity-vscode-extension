/*
import "reflect-metadata";
const rmock = require("mock-require");
rmock("vscode", { });
import * as tsMockito from "ts-mockito";
import {Summary} from "../../../src/bll/entities/summary";
import {Build} from "../../../src/bll/entities/build";
import {Change} from "../../../src/bll/entities/change";
import {Credentials} from "../../../src/bll/credentialsstore/credentials";
import {InMemoryCredentialsStore} from "../../../src/bll/credentialsstore/inmemorycredentialsstore";
import {NotificationWatcherImpl} from "../../../src/bll/notifications/notificationwatcherimpl";
import {TeamCityOutput} from "../../../src/view/teamcityoutput";
import {SummaryDao} from "../../../src/dal/summarydao";
import {BuildDao} from "../../../src/dal/builddao";
import {RemoteBuildServer} from "../../../src/dal/remotebuildserver";
import {Utils} from "../../../src/bll/utils/utils";
import {UserChangeStatus} from "../../../src/bll/utils/constants";

suite("Notification Watcher Implementation", () => {

    const EXPECTED_TIMEOUT = 400;
    test("When credentials absent it should sleep", function (done) {
        const remoteBuildServer: RemoteBuildServer = getRemoteBuildServerWithSameEventCounter();
        const summaryDaoImpl: SummaryDao = getPermanentSummaryDaoMock();
        const buildDaoImpl: BuildDao = getBuildDaoMock();
        const credentials: Credentials = undefined;
        const credentialsStore: InMemoryCredentialsStore = getCredentialsStoreMock(credentials);
        const teamCityOutput: TeamCityOutput = getOutputMock();
        const watcher: NotificationWatcherImpl = new NotificationWatcherImpl(remoteBuildServer, summaryDaoImpl, buildDaoImpl, credentialsStore, teamCityOutput);

        this.timeout(EXPECTED_TIMEOUT + 100);
        const timeout = setTimeout(done, EXPECTED_TIMEOUT);
        watcher.activate().catch((err) => {
            clearTimeout(timeout);
            done(new Error(`Unexpected error ${Utils.formatErrorMessage(err)}`));
        });
    });

    test("When credentials present it should try to get summary object", function (done) {
        const remoteBuildServer: RemoteBuildServer = getRemoteBuildServerWithSameEventCounter();
        const buildDaoImpl: BuildDao = getBuildDaoMock();
        const credentials: Credentials = new Credentials("URL", "user", "password", "userId", "sessionId");
        const credentialsStore: InMemoryCredentialsStore = getCredentialsStoreMock(credentials);
        const teamCityOutput: TeamCityOutput = getOutputMock();

        const mockedSummaryDaoImpl: SummaryDao = tsMockito.mock(SummaryDao);
        const summaryDaoImplSpy: SummaryDao = tsMockito.instance(mockedSummaryDaoImpl);
        const watcher: NotificationWatcherImpl = new NotificationWatcherImpl(remoteBuildServer, summaryDaoImplSpy, buildDaoImpl, credentialsStore, teamCityOutput);

        watcher.activate().then(() => {
            //do nothing
        });
        Utils.sleep(200).then(() => {
            tsMockito.verify(mockedSummaryDaoImpl.get()).called();
            done();
        });
    });

    test("If counter returns the same value it should sleep", function (done) {
        const remoteBuildServer: RemoteBuildServer = getRemoteBuildServerWithSameEventCounter();
        const summaryDaoImpl: SummaryDao = getPermanentSummaryDaoMock();
        const buildDaoImpl: BuildDao = getBuildDaoMock();
        const credentials: Credentials = new Credentials("URL", "user", "password", "userId", "sessionId");
        const credentialsStore: InMemoryCredentialsStore = getCredentialsStoreMock(credentials);
        const teamCityOutput: TeamCityOutput = getOutputMock();

        const watcher: NotificationWatcherImpl = new NotificationWatcherImpl(remoteBuildServer, summaryDaoImpl, buildDaoImpl, credentialsStore, teamCityOutput);

        this.timeout(EXPECTED_TIMEOUT + 100);
        const timeout = setTimeout(done, EXPECTED_TIMEOUT);
        watcher.activate().catch((err) => {
            clearTimeout(timeout);
            done(new Error(`Unexpected error ${Utils.formatErrorMessage(err)}`));
        });
    });

    test("If there are new changes it should try to get extended info for build", function (done) {
        const mutableRemoteBuildServer: RemoteBuildServer = getRemoteBuildServerWithNewEventCounter();
        const mutableSummaryDaoImpl: SummaryDao = getMutableSummaryDaoMock();
        const credentials: Credentials = new Credentials("URL", "user", "password", "userId", "sessionId");
        const credentialsStore: InMemoryCredentialsStore = getCredentialsStoreMock(credentials);
        const teamCityOutput: TeamCityOutput = getOutputMock();

        const mockedBuildDaoImpl: BuildDao = tsMockito.mock(BuildDao);
        tsMockito.when(mockedBuildDaoImpl.getById(tsMockito.anyNumber())).thenReturn(Promise.resolve(getSimpleBuild()));
        const buildDaoImplSpy: BuildDao = tsMockito.instance(mockedBuildDaoImpl);

        const watcher: NotificationWatcherImpl = new NotificationWatcherImpl(mutableRemoteBuildServer, mutableSummaryDaoImpl, buildDaoImplSpy, credentialsStore, teamCityOutput);
        watcher.activate().catch((err) => {
            done(new Error(`Unexpected error ${Utils.formatErrorMessage(err)}`));
        });
        Utils.sleep(200).then(() => {
            tsMockito.verify(mockedBuildDaoImpl.getById(tsMockito.anyNumber())).called();
            done();
        });
    });

    test("If there are new changes it should display new changes", function (done) {
        const mutableRemoteBuildServer: RemoteBuildServer = getRemoteBuildServerWithNewEventCounter();
        const mutableSummaryDaoImpl: SummaryDao = getMutableSummaryDaoMock();
        const buildDaoImpl: BuildDao = getBuildDaoMock();
        const credentials: Credentials = new Credentials("URL", "user", "password", "userId", "sessionId");
        const credentialsStore: InMemoryCredentialsStore = getCredentialsStoreMock(credentials);
        const mockedOutputImpl: TeamCityOutput = tsMockito.mock(TeamCityOutput);
        const teamCityOutputSpy: TeamCityOutput = tsMockito.instance(mockedOutputImpl);

        const watcher: NotificationWatcherImpl = new NotificationWatcherImpl(mutableRemoteBuildServer, mutableSummaryDaoImpl, buildDaoImpl, credentialsStore, teamCityOutputSpy);
        watcher.activate().catch((err) => {
            done(new Error(`Unexpected error ${Utils.formatErrorMessage(err)}`));
        });
        Utils.sleep(200).then(() => {
            tsMockito.verify(mockedOutputImpl.appendLine(tsMockito.anyString())).called();
            done();
        });
    });

    function getCredentialsStoreMock(credentials: Credentials): InMemoryCredentialsStore {
        const mockedCredentialsStore:InMemoryCredentialsStore = tsMockito.mock(InMemoryCredentialsStore);
        tsMockito.when(mockedCredentialsStore.getCredentialsSilently()).thenReturn(credentials);
        return tsMockito.instance(mockedCredentialsStore);
    }

    function getSimpleBuild(): Build {
        return new Build(1, 1, true, "status", "name", "statusText", "projectName", "webUrl");
    }

    function getSummaryA(): Summary {
        const changes: Change[] = [
            new Change(1, false, UserChangeStatus.CHECKED, [getSimpleBuild()], 239, "123",
                       "Remote Run", new Date(), "")];
        const personalChange: Change[] = [new Change(1, true, UserChangeStatus.CHECKED, [getSimpleBuild()], 239,
                                                     "123", "Remote Run", new Date(), "")];
        return new Summary(["1", "2", "3"], changes, personalChange);
    }

    function getSummaryB(): Summary {
        const changes: Change[] = [new Change(2, false, UserChangeStatus.CHECKED, [getSimpleBuild()], 239,
                                              "123", "Remote Run", new Date(), "")];
        const personalChange: Change[] = [new Change(2, true, UserChangeStatus.CHECKED, [getSimpleBuild()], 239,
                                                     "123", "Remote Run", new Date(), "")];
        return new Summary(["1", "2", "3"], changes, personalChange);
    }

    function getPermanentSummaryDaoMock(): SummaryDao {
        const mockedSummaryDaoImpl: SummaryDao = tsMockito.mock(SummaryDao);
        tsMockito.when(mockedSummaryDaoImpl.get()).thenReturn(Promise.resolve<Summary>(getSummaryA()));
        return tsMockito.instance(mockedSummaryDaoImpl);
    }

    function getMutableSummaryDaoMock(): SummaryDao {
        const mockedSummaryDaoImpl: SummaryDao = tsMockito.mock(SummaryDao);
        tsMockito.when(mockedSummaryDaoImpl.get()).thenReturn(Promise.resolve(getSummaryA()), Promise.resolve(getSummaryB()));
        return tsMockito.instance(mockedSummaryDaoImpl);
    }

    function getRemoteBuildServerWithNewEventCounter(): RemoteBuildServer {
        const mockedRemoteBuildImplServer: RemoteBuildServer = tsMockito.mock(RemoteBuildServer);
        tsMockito.when(mockedRemoteBuildImplServer.getTotalNumberOfEvents(tsMockito.anyString())).thenReturn(Promise.resolve(0), Promise.resolve(1), Promise.resolve(2));
        return tsMockito.instance(mockedRemoteBuildImplServer);
    }

    function getRemoteBuildServerWithSameEventCounter(): RemoteBuildServer {
        const mockedRemoteBuildImplServer: RemoteBuildServer = tsMockito.mock(RemoteBuildServer);
        tsMockito.when(mockedRemoteBuildImplServer.getTotalNumberOfEvents(tsMockito.anyString())).thenReturn(Promise.resolve(0));
        return tsMockito.instance(mockedRemoteBuildImplServer);
    }

    function getBuildDaoMock(): BuildDao {
        const mockedBuildDaoImpl: BuildDao = tsMockito.mock(BuildDao);
        tsMockito.when(mockedBuildDaoImpl.getById(tsMockito.anyNumber())).thenReturn(Promise.resolve(getSimpleBuild()));
        return tsMockito.instance(mockedBuildDaoImpl);
    }

    function getOutputMock(): TeamCityOutput {
        const mockedOutputImpl: TeamCityOutput = tsMockito.mock(TeamCityOutput);
        return tsMockito.instance(mockedOutputImpl);
    }
});
*/
