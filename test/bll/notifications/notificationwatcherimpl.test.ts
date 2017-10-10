"use strict";

import * as tsMockito from "ts-mockito";
import {VsCodeUtils} from "../../../src/bll/utils/vscodeutils";
import {Summary} from "../../../src/bll/entities/summary";
import {Build} from "../../../src/bll/entities/build";
import {Change} from "../../../src/bll/entities/change";
import {Credentials} from "../../../src/bll/credentialsstore/credentials";
import {CredentialsStoreImpl} from "../../../src/bll/credentialsstore/credentialsstoreimpl";
import {NotificationWatcherImpl} from "../../../src/bll/notifications/notificationwatcherimpl";
import {SummaryDaoImpl} from "../../../src/dal/summarydaoimpl";
import {BuildDaoImpl} from "../../../src/dal/builddaoimpl";
import {RemoteBuildServerImpl} from "../../../src/dal/remotebuildserverimpl";
import {TeamCityOutput} from "../../../src/view/teamcityoutput";

suite("Notification Watcher Implementation", () => {

    const EXPECTED_TIMEOUT = 400;
    test("When credentials absent it should sleep", function (done) {
        const remoteBuildServerImpl: RemoteBuildServerImpl = getRemoteBuildServerWithSameEventCounter();
        const summaryDaoImpl: SummaryDaoImpl = getPermanentSummaryDaoMock();
        const buildDaoImpl: BuildDaoImpl = getBuildDaoMock();
        const credentials: Credentials = undefined;
        const credentialsStore: CredentialsStoreImpl = getCredentialsStoreMock(credentials);
        const teamCityOutput: TeamCityOutput = getOutputMock();
        const watcher: NotificationWatcherImpl = new NotificationWatcherImpl(remoteBuildServerImpl, summaryDaoImpl, buildDaoImpl, credentialsStore, teamCityOutput);

        this.timeout(EXPECTED_TIMEOUT + 100);
        const timeout = setTimeout(done, EXPECTED_TIMEOUT);
        watcher.activate().catch((err) => {
            clearTimeout(timeout);
            done(new Error(`Unexpected error ${VsCodeUtils.formatErrorMessage(err)}`));
        });
    });

    test("When credentials present it should try to get summary object", function (done) {
        const remoteBuildServerImpl: RemoteBuildServerImpl = getRemoteBuildServerWithSameEventCounter();
        const buildDaoImpl: BuildDaoImpl = getBuildDaoMock();
        const credentials: Credentials = new Credentials("URL", "user", "password", "userId", "sessionId");
        const credentialsStore: CredentialsStoreImpl = getCredentialsStoreMock(credentials);
        const teamCityOutput: TeamCityOutput = getOutputMock();

        const mockedSummaryDaoImpl: SummaryDaoImpl = tsMockito.mock(SummaryDaoImpl);
        const summaryDaoImplSpy: SummaryDaoImpl = tsMockito.instance(mockedSummaryDaoImpl);
        const watcher: NotificationWatcherImpl = new NotificationWatcherImpl(remoteBuildServerImpl, summaryDaoImplSpy, buildDaoImpl, credentialsStore, teamCityOutput);

        watcher.activate().then(() => {
            //do nothing
        });
        VsCodeUtils.sleep(200).then(() => {
            tsMockito.verify(mockedSummaryDaoImpl.get()).called();
            done();
        });
    });

    test("If counter returns the same value it should sleep", function (done) {
        const remoteBuildServerImpl: RemoteBuildServerImpl = getRemoteBuildServerWithSameEventCounter();
        const summaryDaoImpl: SummaryDaoImpl = getPermanentSummaryDaoMock();
        const buildDaoImpl: BuildDaoImpl = getBuildDaoMock();
        const credentials: Credentials = new Credentials("URL", "user", "password", "userId", "sessionId");
        const credentialsStore: CredentialsStoreImpl = getCredentialsStoreMock(credentials);
        const teamCityOutput: TeamCityOutput = getOutputMock();

        const watcher: NotificationWatcherImpl = new NotificationWatcherImpl(remoteBuildServerImpl, summaryDaoImpl, buildDaoImpl, credentialsStore, teamCityOutput);

        this.timeout(EXPECTED_TIMEOUT + 100);
        const timeout = setTimeout(done, EXPECTED_TIMEOUT);
        watcher.activate().catch((err) => {
            clearTimeout(timeout);
            done(new Error(`Unexpected error ${VsCodeUtils.formatErrorMessage(err)}`));
        });
    });

    test("If there are new changes it should try to get extended info for build", function (done) {
        const mutableRemoteBuildServerImpl: RemoteBuildServerImpl = getRemoteBuildServerWithNewEventCounter();
        const mutableSummaryDaoImpl: SummaryDaoImpl = getMutableSummaryDaoMock();
        const credentials: Credentials = new Credentials("URL", "user", "password", "userId", "sessionId");
        const credentialsStore: CredentialsStoreImpl = getCredentialsStoreMock(credentials);
        const teamCityOutput: TeamCityOutput = getOutputMock();

        const mockedBuildDaoImpl: BuildDaoImpl = tsMockito.mock(BuildDaoImpl);
        tsMockito.when(mockedBuildDaoImpl.getById(tsMockito.anyNumber())).thenReturn(Promise.resolve(getSimpleBuild()));
        const buildDaoImplSpy: BuildDaoImpl = tsMockito.instance(mockedBuildDaoImpl);

        const watcher: NotificationWatcherImpl = new NotificationWatcherImpl(mutableRemoteBuildServerImpl, mutableSummaryDaoImpl, buildDaoImplSpy, credentialsStore, teamCityOutput);
        watcher.activate().catch((err) => {
            done(new Error(`Unexpected error ${VsCodeUtils.formatErrorMessage(err)}`));
        });
        VsCodeUtils.sleep(200).then(() => {
            tsMockito.verify(mockedBuildDaoImpl.getById(tsMockito.anyNumber())).called();
            done();
        });
    });

    test("If there are new changes it should display new changes", function (done) {
        const mutableRemoteBuildServerImpl: RemoteBuildServerImpl = getRemoteBuildServerWithNewEventCounter();
        const mutableSummaryDaoImpl: SummaryDaoImpl = getMutableSummaryDaoMock();
        const buildDaoImpl: BuildDaoImpl = getBuildDaoMock();
        const credentials: Credentials = new Credentials("URL", "user", "password", "userId", "sessionId");
        const credentialsStore: CredentialsStoreImpl = getCredentialsStoreMock(credentials);
        const mockedOutputImpl: TeamCityOutput = tsMockito.mock(TeamCityOutput);
        const teamCityOutputSpy: TeamCityOutput = tsMockito.instance(mockedOutputImpl);

        const watcher: NotificationWatcherImpl = new NotificationWatcherImpl(mutableRemoteBuildServerImpl, mutableSummaryDaoImpl, buildDaoImpl, credentialsStore, teamCityOutputSpy);
        watcher.activate().catch((err) => {
            done(new Error(`Unexpected error ${VsCodeUtils.formatErrorMessage(err)}`));
        });
        VsCodeUtils.sleep(200).then(() => {
            tsMockito.verify(mockedOutputImpl.appendLine(tsMockito.anyString())).called();
            done();
        });
    });

    function getCredentialsStoreMock(credentials: Credentials): CredentialsStoreImpl {
        const mockedCredentialsStore:CredentialsStoreImpl = tsMockito.mock(CredentialsStoreImpl);
        tsMockito.when(mockedCredentialsStore.getCredentialsSilently()).thenReturn(credentials);
        return tsMockito.instance(mockedCredentialsStore);
    }

    function getSimpleBuild(): Build {
        return new Build(1, 1, true, "status", "name", "statusText", "projectName", "webUrl");
    }

    function getSummaryA(): Summary {
        const changes: Change[] = [new Change(1, false, "CHECKED", [getSimpleBuild()])];
        const personalChange: Change[] = [new Change(1, true, "CHECKED", [getSimpleBuild()])];
        return new Summary(["1", "2", "3"], changes, personalChange);
    }

    function getSummaryB(): Summary {
        const changes: Change[] = [new Change(2, false, "CHECKED", [getSimpleBuild()])];
        const personalChange: Change[] = [new Change(2, true, "CHECKED", [getSimpleBuild()])];
        return new Summary(["1", "2", "3"], changes, personalChange);
    }

    function getPermanentSummaryDaoMock(): SummaryDaoImpl {
        const mockedSummaryDaoImpl: SummaryDaoImpl = tsMockito.mock(SummaryDaoImpl);
        tsMockito.when(mockedSummaryDaoImpl.get()).thenReturn(Promise.resolve<Summary>(getSummaryA()));
        return tsMockito.instance(mockedSummaryDaoImpl);
    }

    function getMutableSummaryDaoMock(): SummaryDaoImpl {
        const mockedSummaryDaoImpl: SummaryDaoImpl = tsMockito.mock(SummaryDaoImpl);
        tsMockito.when(mockedSummaryDaoImpl.get()).thenReturn(Promise.resolve(getSummaryA()), Promise.resolve(getSummaryB()));
        return tsMockito.instance(mockedSummaryDaoImpl);
    }

    function getRemoteBuildServerWithNewEventCounter(): RemoteBuildServerImpl {
        const mockedRemoteBuildImplServer: RemoteBuildServerImpl = tsMockito.mock(RemoteBuildServerImpl);
        tsMockito.when(mockedRemoteBuildImplServer.getTotalNumberOfEvents(tsMockito.anyString())).thenReturn(Promise.resolve(0), Promise.resolve(1), Promise.resolve(2));
        return tsMockito.instance(mockedRemoteBuildImplServer);
    }

    function getRemoteBuildServerWithSameEventCounter(): RemoteBuildServerImpl {
        const mockedRemoteBuildImplServer: RemoteBuildServerImpl = tsMockito.mock(RemoteBuildServerImpl);
        tsMockito.when(mockedRemoteBuildImplServer.getTotalNumberOfEvents(tsMockito.anyString())).thenReturn(Promise.resolve(0));
        return tsMockito.instance(mockedRemoteBuildImplServer);
    }

    function getBuildDaoMock(): BuildDaoImpl {
        const mockedBuildDaoImpl: BuildDaoImpl = tsMockito.mock(BuildDaoImpl);
        tsMockito.when(mockedBuildDaoImpl.getById(tsMockito.anyNumber())).thenReturn(Promise.resolve(getSimpleBuild()));
        return tsMockito.instance(mockedBuildDaoImpl);
    }

    function getOutputMock(): TeamCityOutput {
        const mockedOutputImpl: TeamCityOutput = tsMockito.mock(TeamCityOutput);
        return tsMockito.instance(mockedOutputImpl);
    }
});
