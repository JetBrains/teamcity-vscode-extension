"use strict";

import {Credentials} from "../src/bll/credentialsstore/credentials";
import {WindowsCredentialStoreApi} from "../src/bll/credentialsstore/win32/win-credstore-api";
import {OsxKeychainApi} from "../src/bll/credentialsstore/osx/osx-keychain-api";
import {LinuxFileApi} from "../src/bll/credentialsstore/linux/linux-file-api";

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
    private static testCredentialsWithSpesicficCharacters;

    public static get credentials(): Credentials {
        if (!TestSettings.testCredentials) {
            TestSettings.testCredentials = new Credentials(TestSettings.url, TestSettings.account, TestSettings.password, "test", "test");
        }
        return TestSettings.testCredentials;
    }

    public static get credentialsWithSpesificCharacters(): Credentials {
        if (!TestSettings.testCredentialsWithSpesicficCharacters) {
            const spesificCharacters = "[]|*+*-/*-&%^!@%#+)((^!%!";
            TestSettings.testCredentialsWithSpesicficCharacters =
                new Credentials(TestSettings.url + spesificCharacters, TestSettings.account + spesificCharacters,
                                TestSettings.password + spesificCharacters, "test", "test");
        }
        return TestSettings.testCredentialsWithSpesicficCharacters;
    }

    public static get winCredentials(): any {
        return {
            credential: new Buffer(TestSettings.password),
            targetName: TestSettings.url + WindowsCredentialStoreApi.separator + TestSettings.account
        };
    }

    public static get anotherWinCredentials(): any {
        return {
            credential: new Buffer(TestSettings.password + 2),
            targetName: TestSettings.url + 2 + WindowsCredentialStoreApi.separator + TestSettings.account + 2
        };
    }

    public static get osxCredentials(): any {
        return {
            svce: OsxKeychainApi.prefix,
            acct: TestSettings.url + OsxKeychainApi.separator + TestSettings.account
        };
    }

    public static get otherOsxCredentials(): any {
        return {
            svce: OsxKeychainApi.prefix + 2,
            acct: TestSettings.url + 2 + OsxKeychainApi.separator + TestSettings.account + 2
        };
    }

    public static get linuxCredentialsObj(): any {
        return {
            service: LinuxFileApi.SERVICE_PREFIX,
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
            service: OsxKeychainApi.prefix,
            url: TestSettings.url + 2,
            username: TestSettings.account + 2,
            password: TestSettings.password + 2
        };
    }

    public static get persistentCredentialsPrefix(): string {
        return "test_teamcity_vsaddin:";
    }

    public static get win32Platform(): NodeJS.Platform {
        return "win32";
    }

    public static get winCredentialsExample(): string {
        return this.winStorageExample;
    }

    private static readonly winStorageExample = `Target Name: test_teamcity_vsaddin:${TestSettings.url}|${TestSettings.account}\n` +
        "win-credstore-parser.ts:27\n" +
        "Type: Generic\n" +
        "User Name: creds.exe\n" +
        "Credential: 746573745f70617373776f7264";
}
