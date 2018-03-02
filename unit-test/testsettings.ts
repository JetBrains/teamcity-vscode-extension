"use strict";

import {Credentials} from "../src/bll/credentialsstore/credentials";
import {WindowsCredentialStoreApi} from "../src/bll/credentialsstore/win32/win-credstore-api";
import {OsxKeychainApi} from "../src/bll/credentialsstore/osx/osx-keychain-api";
import {Constants} from "../src/bll/utils/constants";

export class TestSettings {

    public static get account(): string {
        return "test_username";
    }

    public static get password(): string {
        return "test_password";
    }

    public static get url(): string {
        return "http://localhost:" + this.port;
    }

    public static get port(): string {
        return "8222";
    }

    public static get basicAuthHeader(): string {
        //for test_username:test_password
        return "Basic dGVzdF91c2VybmFtZTp0ZXN0X3Bhc3N3b3Jk";
    }

    private static testCredentials;

    public static get credentials(): Credentials {
        if (!TestSettings.testCredentials) {
            TestSettings.testCredentials = new Credentials(TestSettings.url, TestSettings.account, TestSettings.password, "test", "test");
        }
        return TestSettings.testCredentials;
    }

    public static get winCredentials(): any {
        const encruptedUrl = new Buffer(TestSettings.url, "utf8").toString("hex");
        const encruptedUsername = new Buffer(TestSettings.account, "utf8").toString("hex");
        return {
            credential: new Buffer(TestSettings.password),
            targetName: encruptedUrl + WindowsCredentialStoreApi.separator + encruptedUsername
        };
    }

    public static get anotherWinCredentials(): any {
        const encruptedUrl = new Buffer(TestSettings.url + 2, "utf8").toString("hex");
        const encruptedUsername = new Buffer(TestSettings.account + 2, "utf8").toString("hex");
        return {
            credential: new Buffer(TestSettings.password + 2),
            targetName: encruptedUrl + WindowsCredentialStoreApi.separator + encruptedUsername
        };
    }

    public static get osxCredentials(): any {
        const encruptedUrl = new Buffer(TestSettings.url, "utf8").toString("hex");
        const encruptedUsername = new Buffer(TestSettings.account, "utf8").toString("hex");
        return {
            svce: Constants.SERVICE_PREFIX,
            acct: encruptedUrl + OsxKeychainApi.separator + encruptedUsername
        };
    }

    public static get otherOsxCredentials(): any {
        const encruptedUrl = new Buffer(TestSettings.url + 2, "utf8").toString("hex");
        const encruptedUsername = new Buffer(TestSettings.account + 2, "utf8").toString("hex");
        return {
            svce: Constants.SERVICE_PREFIX,
            acct: encruptedUrl + OsxKeychainApi.separator + encruptedUsername
        };
    }

    public static get linuxCredentialsObj(): any {
        return {
            service: Constants.SERVICE_PREFIX,
            url: TestSettings.url,
            username: TestSettings.account,
            password: TestSettings.password
        };
    }

    public static get linuxCredentialsString(): any {
        return JSON.stringify([TestSettings.linuxCredentialsObj]);
    }

    public static get otherLinuxCredentials(): any {
        return {
            service: Constants.SERVICE_PREFIX,
            url: TestSettings.url + 2,
            username: TestSettings.account + 2,
            password: TestSettings.password + 2
        };
    }

    public static get persistentCredentialsPrefix(): string {
        return Constants.SERVICE_PREFIX;
    }

    public static get win32Platform(): NodeJS.Platform {
        return "win32";
    }

    public static get winCredentialsExample(): string {
        return this.winStorageExample;
    }

    private static readonly winStorageExample = `Target Name: test_teamcity_vsaddin:${TestSettings.winCredentials.targetName}\n` +
        "win-credstore-parser.ts:27\n" +
        "Type: Generic\n" +
        "User Name: creds.exe\n" +
        "Credential: 746573745f70617373776f7264";
}
