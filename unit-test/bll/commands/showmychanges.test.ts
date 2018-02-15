import "reflect-metadata";
import {assert} from "chai";
import {ShowMyChanges} from "../../../src/bll/commands/showmychanges";
import {instance, mock, when} from "ts-mockito";
import {SummaryDao} from "../../../src/dal/summarydao";
import {Summary} from "../../../src/bll/entities/summary";
import {Change} from "../../../src/bll/entities/change";
import {Build} from "../../../src/bll/entities/build";
import * as TypeMoq from "typemoq";
import {IChangesProvider} from "../../../src/view/dataproviders/interfaces/ichangesprovider";
import {TimePeriod} from "../../../src/bll/entities/timeperiod";

const rmock = require("mock-require");
rmock("vscode", { });

suite("Show My Changes", () => {
    test("should verify constructor", function () {
        const summaryDaoMock = mock(SummaryDao);
        const summaryDaoSpy = instance(summaryDaoMock);
        const changesProviderMock: TypeMoq.IMock<IChangesProvider> = TypeMoq.Mock.ofType<IChangesProvider>();
        const changesProviderSpy: IChangesProvider = changesProviderMock.object;
        new ShowMyChanges(summaryDaoSpy, changesProviderSpy);
    });

    test("should verify simple command", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getSummaryA()));
        const summaryDaoSpy = instance(summaryDaoMock);
        const changesProviderMock: TypeMoq.IMock<IChangesProvider> = TypeMoq.Mock.ofType<IChangesProvider>();
        const changesProviderSpy: IChangesProvider = changesProviderMock.object;
        const command = new ShowMyChanges(summaryDaoSpy, changesProviderSpy);
        command.exec().then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify changes Provider was called", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getSummaryA()));
        const summaryDaoSpy = instance(summaryDaoMock);
        const changesProviderMock: TypeMoq.IMock<IChangesProvider> = TypeMoq.Mock.ofType<IChangesProvider>();
        const changesProviderSpy: IChangesProvider = changesProviderMock.object;
        const command = new ShowMyChanges(summaryDaoSpy, changesProviderSpy);
        command.exec().then(() => {
            changesProviderMock.verify((foo) => foo.setContent(TypeMoq.It.isAny()), TypeMoq.Times.atLeastOnce());
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify when there is no changes", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getSummaryWithoutChanges()));
        const summaryDaoSpy = instance(summaryDaoMock);
        const changesProviderMock: TypeMoq.IMock<IChangesProvider> = TypeMoq.Mock.ofType<IChangesProvider>();
        const changesProviderSpy: IChangesProvider = changesProviderMock.object;
        const command = new ShowMyChanges(summaryDaoSpy, changesProviderSpy);
        command.exec().then(() => {
            changesProviderMock.verify((foo) => foo.setContent(TypeMoq.It.isAny()), TypeMoq.Times.never());
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify all changes were received by change provider", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getSummaryA()));
        const summaryDaoSpy = instance(summaryDaoMock);
        const changesProviderSpy = new ChangesProviderCustomSpy();
        const command = new ShowMyChanges(summaryDaoSpy, changesProviderSpy);
        command.exec().then(() => {
            assert.equal(changesProviderSpy.allChanges.length, 2);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify ", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenThrow(new Error("any exception"));
        const summaryDaoSpy = instance(summaryDaoMock);
        const changesProviderMock: TypeMoq.IMock<IChangesProvider> = TypeMoq.Mock.ofType<IChangesProvider>();
        const changesProviderSpy: IChangesProvider = changesProviderMock.object;
        const command = new ShowMyChanges(summaryDaoSpy, changesProviderSpy);
        command.exec().then(() => {
            done("there should be an exception");
        }).catch(() => {
            done();
        });
    });
});

function getSummaryA(): Summary {
    const changes: Change[] = [new Change(1, false, "CHECKED", [getSimpleBuild()], 239, "123", "Remote Run", new Date())];
    const personalChange: Change[] = [new Change(1, true, "CHECKED", [getSimpleBuild()], 239, "123", "Remote Run", new Date())];
    return new Summary(["1", "2", "3"], changes, personalChange);
}

function getSummaryWithoutChanges(): Summary {
    const changes: Change[] = [];
    const personalChange: Change[] = [];
    return new Summary(["1", "2", "3"], changes, personalChange);
}

function getSimpleBuild(): Build {
    return new Build(1, 1, true, "status", "name", "statusText", "projectName", "webUrl");
}

class ChangesProviderCustomSpy implements IChangesProvider {
    public allChanges: Change[] = [];
    resetTreeContent(): void {
        //
    }

    setContent(periods: TimePeriod[]): void {
        periods.forEach((period) => {
            period.changes.forEach((change) => {
                this.allChanges.push(change);
            });
        });
    }
}
