"use strict";

import "reflect-metadata";
import {anything, instance, mock, verify, when} from "ts-mockito";
import {WinPersistentCredentialsStore} from "../../../../src/bll/credentialsstore/win32/win-credstore";
import {assert} from "chai";
import {
    WinCredStoreParsingStream,
    WinCredStoreParsingStreamWrapper
} from "../../../../src/bll/credentialsstore/win32/win-credstore-parser";
import {CpProxy} from "../../../../src/bll/moduleproxies/cp-proxy";
import {TestSettings} from "../../../testsettings";
import * as stream from "stream";

suite("WindowsCredentialStoreApi", () => {
    test("should verify getCredentialsListStream", function () {
        const readable: any = new stream.Readable({ objectMode: true });
        const cpMock: CpProxy = mock(CpProxy);
        when(cpMock.spawn(anything(), anything())).thenReturn({
            stdout: readable
        });
        //tslint:disable-next-line: no-null-keyword
        readable.push(null);
        const cpSpy: CpProxy = instance(cpMock);
        const wrapperMock: WinCredStoreParsingStreamWrapper = mock(WinCredStoreParsingStreamWrapper);
        when(wrapperMock.parser()).thenReturn(new WinCredStoreParsingStream());
        const wrapperSpy: WinCredStoreParsingStreamWrapper = instance(wrapperMock);
        const winCredStore: WinPersistentCredentialsStore = new WinPersistentCredentialsStore(wrapperSpy, cpSpy);
        winCredStore.getCredentialsListStream();
        verify(cpMock.spawn(anything(), anything())).called();
    });

    test("should verify getCredentialsListStream with real data", function (done) {
        const readable: any = new stream.Readable({ objectMode: true });
        const cpMock: CpProxy = mock(CpProxy);
        when(cpMock.spawn(anything(), anything())).thenReturn({
            stdout: readable
        });
        readable.push(TestSettings.winCredentialsExample);
        //tslint:disable-next-line: no-null-keyword
        readable.push(null);
        const cpSpy: CpProxy = instance(cpMock);
        const wrapperMock: WinCredStoreParsingStreamWrapper = mock(WinCredStoreParsingStreamWrapper);
        when(wrapperMock.parser()).thenReturn(new WinCredStoreParsingStream());
        const wrapperSpy: WinCredStoreParsingStreamWrapper = instance(wrapperMock);
        const winCredStore: WinPersistentCredentialsStore = new WinPersistentCredentialsStore(wrapperSpy, cpSpy);
        const credsStream = winCredStore.getCredentialsListStream();
        const creds: any[] = [];
        credsStream.on("data", (cred) => {
            creds.push(cred);
        });
        credsStream.on("end", () => {
            const actualCreds = new Buffer(creds[0].credential, "hex").toString("utf8");
            const expectedCreds = TestSettings.winCredentials.credential.toString("utf8");
            assert.equal(actualCreds, expectedCreds);
            assert.equal(creds[0].targetName, TestSettings.persistentCredentialsPrefix + TestSettings.winCredentials.targetName);
            done();
        });
    });

    test("should verify set", function (done) {
        const cpMock: CpProxy = mock(CpProxy);
        const cpSpy: CpProxy = instance(cpMock);
        const wrapperMock: WinCredStoreParsingStreamWrapper = mock(WinCredStoreParsingStreamWrapper);
        const wrapperSpy: WinCredStoreParsingStreamWrapper = instance(wrapperMock);
        const winCredStore: WinPersistentCredentialsStore = new WinPersistentCredentialsStore(wrapperSpy, cpSpy);
        winCredStore.set(TestSettings.url + "|" + TestSettings.account, TestSettings.password).then(() => {
            verify(cpMock.execFileAsync(anything(), anything())).called();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test("should verify remove", async function () {
        const cpMock: CpProxy = mock(CpProxy);
        const cpSpy: CpProxy = instance(cpMock);
        const wrapperMock: WinCredStoreParsingStreamWrapper = mock(WinCredStoreParsingStreamWrapper);
        const wrapperSpy: WinCredStoreParsingStreamWrapper = instance(wrapperMock);
        const winCredStore: WinPersistentCredentialsStore = new WinPersistentCredentialsStore(wrapperSpy, cpSpy);
        await winCredStore.remove(TestSettings.url + "|" + TestSettings.account);
        verify(cpMock.execFileAsync(anything(), anything())).called();
    });
});
