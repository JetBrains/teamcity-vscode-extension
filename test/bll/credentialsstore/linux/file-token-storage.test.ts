"use strict";

import {anything, instance, mock, verify, when} from "ts-mockito";
import {TestSettings} from "../../../testsettings";
import {assert} from "chai";
import {FileTokenStorage} from "../../../../src/bll/credentialsstore/linux/file-token-storage";
import {FsProxy} from "../../../../src/bll/moduleproxies/fs-proxy";
import {LinuxFileApi} from "../../../../src/bll/credentialsstore/linux/linux-file-api";
import {PathProxy} from "../../../../src/bll/moduleproxies/path-proxy";

suite("FileTokenStorage", () => {

    test("should verify loadEntries before setting filename", async function () {
        const fsMock: FsProxy = mock(FsProxy);
        const fsSpy: FsProxy = instance(fsMock);
        const fileTokenStorage: FileTokenStorage = new FileTokenStorage(fsSpy, undefined);
        await fileTokenStorage.loadEntries();
        verify(fsMock.readFileAsync(undefined, anything())).called();
    });

    test("should verify loadEntries after setting filename", async function () {
        const fsMock: FsProxy = mock(FsProxy);
        const fsSpy: FsProxy = instance(fsMock);
        const fileName = "testFile";
        const fileTokenStorage: FileTokenStorage = new FileTokenStorage(fsSpy, undefined);
        fileTokenStorage.setFilename(fileName);
        await fileTokenStorage.loadEntries();
        verify(fsMock.readFileAsync(fileName, anything())).called();
    });

    test("should verify loadEntries return value", async function () {
        const fsMock: FsProxy = mock(FsProxy);
        const resultPromise: Promise<string> = new Promise((resolve) => {
            resolve(TestSettings.linuxCredentialsString);
        });
        when(fsMock.readFileAsync(anything(), anything())).thenReturn(resultPromise);
        const fsSpy: FsProxy = instance(fsMock);

        const fileTokenStorage: FileTokenStorage = new FileTokenStorage(fsSpy, undefined);
        const entries: any[] = await fileTokenStorage.loadEntries();
        assert.notEqual(entries, undefined);
        assert.equal(entries.length, 1);
        assert.equal(entries[0].url, TestSettings.url);
        assert.equal(entries[0].username, TestSettings.account);
        assert.equal(entries[0].service, LinuxFileApi.SERVICE_PREFIX);
        assert.equal(entries[0].password, TestSettings.password);
    });

    test("should verify keepEntries", function (done) {
        const fsMock: FsProxy = mock(FsProxy);
        const fsSpy: FsProxy = instance(fsMock);
        const pathMock: PathProxy = mock(PathProxy);
        const pathSpy: PathProxy = instance(pathMock);
        const fileTokenStorage: FileTokenStorage = new FileTokenStorage(fsSpy, pathSpy);

        fileTokenStorage.keepEntries([]).then(() => {
            verify(fsMock.writeFileAsync(anything(), anything(), anything())).called();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify keepEntries: folder for file will be created, when it doesn't exist", function (done) {
        const fsMock: FsProxy = mock(FsProxy);
        const resultPromise: Promise<boolean> = new Promise((resolve) => {
            resolve(false);
        });
        when(fsMock.existsAsync(anything())).thenReturn(resultPromise);
        const fsSpy: FsProxy = instance(fsMock);
        const pathMock: PathProxy = mock(PathProxy);
        const pathSpy: PathProxy = instance(pathMock);

        const fileTokenStorage: FileTokenStorage = new FileTokenStorage(fsSpy, pathSpy);
        fileTokenStorage.keepEntries([]).then(() => {
            verify(fsMock.mkdirAsync(anything())).called();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify keepEntries: folder for file won't be created, when it exists", function (done) {
        const fsMock: FsProxy = mock(FsProxy);
        const resultPromise: Promise<boolean> = new Promise((resolve) => {
            resolve(true);
        });
        when(fsMock.existsAsync(anything())).thenReturn(resultPromise);
        const fsSpy: FsProxy = instance(fsMock);
        const pathMock: PathProxy = mock(PathProxy);
        const pathSpy: PathProxy = instance(pathMock);

        const fileTokenStorage: FileTokenStorage = new FileTokenStorage(fsSpy, pathSpy);
        fileTokenStorage.keepEntries([]).then(() => {
            verify(fsMock.mkdirAsync(anything())).never();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify clear", function (done) {
        const fsMock: FsProxy = mock(FsProxy);
        const fsSpy: FsProxy = instance(fsMock);
        const pathMock: PathProxy = mock(PathProxy);
        const pathSpy: PathProxy = instance(pathMock);

        const fileTokenStorage: FileTokenStorage = new FileTokenStorage(fsSpy, pathSpy);
        fileTokenStorage.clear().then(() => {
            verify(fsMock.writeFileAsync(undefined, JSON.stringify([]), anything())).called();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify addEntries", function (done) {
        const fsMock: FsProxy = mock(FsProxy);
        const fsSpy: FsProxy = instance(fsMock);
        const pathMock: PathProxy = mock(PathProxy);
        const pathSpy: PathProxy = instance(pathMock);

        const fileTokenStorage: FileTokenStorage = new FileTokenStorage(fsSpy, pathSpy);
        const newEntries = [TestSettings.linuxCredentialsObj];
        const existingEntries = [TestSettings.linuxCredentialsObj];
        const resultEntries = [TestSettings.linuxCredentialsObj, TestSettings.linuxCredentialsObj];

        fileTokenStorage.addEntries(newEntries, existingEntries).then(() => {
            verify(fsMock.writeFileAsync(undefined, JSON.stringify(resultEntries), anything())).called();
            done();
        }).catch((err) => {
            done(err);
        });
    });

});
