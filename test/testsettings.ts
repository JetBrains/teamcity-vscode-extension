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
        return "http://test_url";
    }

    private static testCredentials;
    public static get credentials(): Credentials {
        if (!TestSettings.testCredentials) {
            TestSettings.testCredentials = new Credentials(TestSettings.url, TestSettings.account, TestSettings.password, "test", "test");
        }
        return TestSettings.testCredentials;
    }

    public static get winCredentials(): any {
        return {
            credential: new Buffer(TestSettings.password),
            targetName: TestSettings.url + WindowsCredentialStoreApi.separator + TestSettings.account};
    }

    public static get anotherWinCredentials(): any {
        return {
            credential: new Buffer(TestSettings.password + 2),
            targetName: TestSettings.url + 2 + WindowsCredentialStoreApi.separator + TestSettings.account + 2};
    }

    public static get osxCredentials(): any {
        return {
            svce: OsxKeychainApi.prefix,
            acct: TestSettings.url + OsxKeychainApi.separator + TestSettings.account};
    }

    public static get otherOsxCredentials(): any {
        return {
            svce: OsxKeychainApi.prefix + 2,
            acct: TestSettings.url + 2 + OsxKeychainApi.separator + TestSettings.account + 2};
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

    public static get osxCredentialsExample(): string {
        return this.osxStorageExample;
    }

    private static readonly osxStorageExample = "keychain: \"/Users/jetbrains/Library/Keychains/login.keychain-db\"\n" +
        "version: 512\n" +
        "class: \"genp\"\n" +
        "attributes:\n" +
        "    0x00000007 <blob>=\"teamcity_vscode:\"\n" +
        "    0x00000008 <blob>=<NULL>\n" +
        "    \"acct\"<blob>=\"http://localhost:8111|rugpanov\"\n" +
        "    \"cdat\"<timedate>=0x32303137313232323038353932315A00  \"20171222085921Z\\000\"\n" +
        "    \"crtr\"<uint32>=<NULL>\n" +
        "    \"cusi\"<sint32>=<NULL>\n" +
        "    \"desc\"<blob>=<NULL>\n" +
        "    \"gena\"<blob>=<NULL>\n" +
        "    \"icmt\"<blob>=<NULL>\n" +
        "    \"invi\"<sint32>=<NULL>\n" +
        "    \"mdat\"<timedate>=0x32303137313232323038353932315A00  \"20171222085921Z\\000\"\n" +
        "    \"nega\"<sint32>=<NULL>\n" +
        "    \"prot\"<blob>=<NULL>\n" +
        "    \"scrp\"<sint32>=<NULL>\n" +
        "    \"svce\"<blob>=\"teamcity_vscode:\"\n" +
        "    \"type\"<uint32>=<NULL>";
}
