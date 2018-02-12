import "reflect-metadata";
import {assert} from "chai";
import {ShowMyChanges} from "../../../src/bll/commands/showmychanges";
import {anything, instance, mock, verify, when} from "ts-mockito";
import {SummaryDao} from "../../../src/dal/summarydao";
import {TeamCityOutput} from "../../../src/view/teamcityoutput";
import {Summary} from "../../../src/bll/entities/summary";
import {Change} from "../../../src/bll/entities/change";
import {Build} from "../../../src/bll/entities/build";
import {Output} from "../../../src/view/output";
import * as TypeMoq from "typemoq";
import {IChangesProvider} from "../../../src/view/dataproviders/interfaces/ichangesprovider";

const rmock = require("mock-require");
rmock("vscode", { });

suite("Show My Changes", () => {
    test("should verify constructor", function () {
        const summaryDaoMock = mock(SummaryDao);
        const summaryDaoSpy = instance(summaryDaoMock);
        const outputMock = mock(TeamCityOutput);
        const outputSpy = instance(outputMock);
        const changesProviderMock: TypeMoq.IMock<IChangesProvider> = TypeMoq.Mock.ofType<IChangesProvider>();
        const changesProviderSpy: IChangesProvider = changesProviderMock.object;
        new ShowMyChanges(summaryDaoSpy, outputSpy, changesProviderSpy);
    });

    test("should verify simple command", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getSummaryA()));
        const summaryDaoSpy = instance(summaryDaoMock);
        const outputMock = mock(TeamCityOutput);
        const outputSpy = instance(outputMock);
        const changesProviderMock: TypeMoq.IMock<IChangesProvider> = TypeMoq.Mock.ofType<IChangesProvider>();
        const changesProviderSpy: IChangesProvider = changesProviderMock.object;
        const command = new ShowMyChanges(summaryDaoSpy, outputSpy, changesProviderSpy);
        command.exec().then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify output was called", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getSummaryA()));
        const summaryDaoSpy = instance(summaryDaoMock);
        const outputMock = mock(TeamCityOutput);
        const outputSpy = instance(outputMock);
        const changesProviderMock: TypeMoq.IMock<IChangesProvider> = TypeMoq.Mock.ofType<IChangesProvider>();
        const changesProviderSpy: IChangesProvider = changesProviderMock.object;
        const command = new ShowMyChanges(summaryDaoSpy, outputSpy, changesProviderSpy);
        command.exec().then(() => {
            verify(outputMock.appendLine(anything())).called();
            verify(outputMock.show()).called();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify when there is no changes", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getSummaryWithoutChanges()));
        const summaryDaoSpy = instance(summaryDaoMock);
        const outputCustomMock = new OutputMock();
        const changesProviderMock: TypeMoq.IMock<IChangesProvider> = TypeMoq.Mock.ofType<IChangesProvider>();
        const changesProviderSpy: IChangesProvider = changesProviderMock.object;
        const command = new ShowMyChanges(summaryDaoSpy, outputCustomMock, changesProviderSpy);
        command.exec().then(() => {
            assert.equal(outputCustomMock.receivedLines.join("").indexOf("|"), -1);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify description was printed", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenReturn(Promise.resolve(getSummaryA()));
        const summaryDaoSpy = instance(summaryDaoMock);
        const outputCustomMock = new OutputMock();
        const changesProviderMock: TypeMoq.IMock<IChangesProvider> = TypeMoq.Mock.ofType<IChangesProvider>();
        const changesProviderSpy: IChangesProvider = changesProviderMock.object;
        const command = new ShowMyChanges(summaryDaoSpy, outputCustomMock, changesProviderSpy);
        command.exec().then(() => {
            assert.notEqual(outputCustomMock.receivedLines.join("").indexOf("239"), -1);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify when", function (done) {
        const summaryDaoMock = mock(SummaryDao);
        when(summaryDaoMock.get()).thenThrow(new Error("any exception"));
        const summaryDaoSpy = instance(summaryDaoMock);
        const outputCustomMock = new OutputMock();
        const changesProviderMock: TypeMoq.IMock<IChangesProvider> = TypeMoq.Mock.ofType<IChangesProvider>();
        const changesProviderSpy: IChangesProvider = changesProviderMock.object;
        const command = new ShowMyChanges(summaryDaoSpy, outputCustomMock, changesProviderSpy);
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

class OutputMock implements Output {
    readonly receivedLines = [];
    show() {
        return;
    }

    appendLine(line: string) {
        this.receivedLines.push(line);
    }

    dispose(): any {
        return undefined;
    }

}
