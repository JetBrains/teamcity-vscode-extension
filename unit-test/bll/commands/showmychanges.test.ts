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
import {TimePeriodEnum, UserChangeStatus} from "../../../src/bll/utils/constants";

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
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getTodaySummary()));
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
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getTodaySummary()));
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

    test("should verify changes Provider was called when only personal changes", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getSummaryOnlyPersonal()));
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

    test("should verify changes Provider was called when only not personal changes", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getSummaryOnlyNotPersonal()));
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

    test("should verify all periods received", function (done) {
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
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getTodaySummary()));
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

    test("should verify all changes were received by change provider", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getTodaySummary()));
        const summaryDaoSpy = instance(summaryDaoMock);
        const changesProviderSpy = new ChangesProviderCustomSpy();
        const command = new ShowMyChanges(summaryDaoSpy, changesProviderSpy);
        command.exec().then(() => {
            assert.equal(changesProviderSpy.allPeriods.length, 3);
            assert.include(changesProviderSpy.allPeriods, TimePeriodEnum.Today);
            assert.include(changesProviderSpy.allPeriods, TimePeriodEnum.Yesterday);
            assert.include(changesProviderSpy.allPeriods, TimePeriodEnum.Older);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify getSummary throws exception", function (done) {
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

    test("should verify today changes", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getTodaySummary()));
        const summaryDaoSpy = instance(summaryDaoMock);
        const changesProviderSpy = new ChangesProviderCustomSpy();
        const command = new ShowMyChanges(summaryDaoSpy, changesProviderSpy);
        command.exec().then(() => {
            assert.equal(changesProviderSpy.allTimePeriods[TimePeriodEnum.Today].length, 2);
            assert.equal(changesProviderSpy.allTimePeriods[TimePeriodEnum.Yesterday].length, 0);
            assert.equal(changesProviderSpy.allTimePeriods[TimePeriodEnum.Older].length, 0);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify yesterday changes", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getYesterdaySummary()));
        const summaryDaoSpy = instance(summaryDaoMock);
        const changesProviderSpy = new ChangesProviderCustomSpy();
        const command = new ShowMyChanges(summaryDaoSpy, changesProviderSpy);
        command.exec().then(() => {
            assert.equal(changesProviderSpy.allTimePeriods[TimePeriodEnum.Today].length, 0);
            assert.equal(changesProviderSpy.allTimePeriods[TimePeriodEnum.Yesterday].length, 2);
            assert.equal(changesProviderSpy.allTimePeriods[TimePeriodEnum.Older].length, 0);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify yesterday changes", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getOlderSummary()));
        const summaryDaoSpy = instance(summaryDaoMock);
        const changesProviderSpy = new ChangesProviderCustomSpy();
        const command = new ShowMyChanges(summaryDaoSpy, changesProviderSpy);
        command.exec().then(() => {
            assert.equal(changesProviderSpy.allTimePeriods[TimePeriodEnum.Today].length, 0);
            assert.equal(changesProviderSpy.allTimePeriods[TimePeriodEnum.Yesterday].length, 0);
            assert.equal(changesProviderSpy.allTimePeriods[TimePeriodEnum.Older].length, 2);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});

function getTodaySummary(): Summary {
    const changes: Change[] = [new Change(1, false, UserChangeStatus.CHECKED, [getSimpleBuild()], 239, "123", "Remote Run", new Date())];
    const personalChange: Change[] = [new Change(1, true, UserChangeStatus.CHECKED, [getSimpleBuild()], 239, "123", "Remote Run", new Date())];
    return new Summary(["1", "2", "3"], changes, personalChange);
}

function getSummaryOnlyPersonal(): Summary {
    const changes: Change[] = [];
    const personalChange: Change[] = [new Change(1, true, UserChangeStatus.CHECKED, [getSimpleBuild()], 239, "123", "Remote Run", new Date())];
    return new Summary(["1", "2", "3"], changes, personalChange);
}

function getSummaryOnlyNotPersonal(): Summary {
    const changes: Change[] = [new Change(1, false, UserChangeStatus.CHECKED, [getSimpleBuild()], 239, "123", "Remote Run", new Date())];
    const personalChange: Change[] = [];
    return new Summary(["1", "2", "3"], changes, personalChange);
}

function getSummaryWithoutChanges(): Summary {
    const changes: Change[] = [];
    const personalChange: Change[] = [];
    return new Summary(["1", "2", "3"], changes, personalChange);
}

function getYesterdaySummary(): Summary {
    const changes: Change[] = [new Change(1, false, UserChangeStatus.CHECKED, [getSimpleBuild()],
                                          239, "123", "Remote Run", yesterday(new Date()))];
    const personalChange: Change[] = [new Change(1, true, UserChangeStatus.CHECKED, [getSimpleBuild()],
                                                 239, "123", "Remote Run", yesterday(new Date()))];
    return new Summary(["1", "2", "3"], changes, personalChange);
}

function getOlderSummary(): Summary {
    const changes: Change[] = [new Change(1, false, UserChangeStatus.CHECKED, [getSimpleBuild()],
                                          239, "123", "Remote Run", yesterday(yesterday(new Date())))];
    const personalChange: Change[] = [new Change(1, true, UserChangeStatus.CHECKED, [getSimpleBuild()],
                                                 239, "123", "Remote Run", yesterday(yesterday(new Date())))];
    return new Summary(["1", "2", "3"], changes, personalChange);
}

function yesterday(date: Date): Date {
    return new Date(date.setDate(date.getDate() - 1));
}

function getSimpleBuild(): Build {
    return new Build(1, 1, true, "status", "name", "statusText", "projectName", "webUrl");
}

class ChangesProviderCustomSpy implements IChangesProvider {
    public allChanges: Change[] = [];
    public allPeriods: TimePeriodEnum[] = [];
    public allTimePeriods = [];
    resetTreeContent(): void {
        //
    }

    setContent(periods: TimePeriod[]): void {
        periods.forEach((period) => {
            this.allTimePeriods[period.timePeriod] = period.changes;
            this.allPeriods.push(period.timePeriod);
            period.changes.forEach((change) => {
                this.allChanges.push(change);
            });
        });
    }
}
