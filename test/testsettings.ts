"use strict";

import {Credentials} from "../src/bll/credentialsstore/credentials";
import {WindowsCredentialStoreApi} from "../src/bll/credentialsstore/win32/win-credstore-api";

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

    public static get persistentCredentialsPrefix(): string {
        return "test_teamcity_vsaddin:";
    }

    public static get win32Platform(): NodeJS.Platform {
        return "win32";
    }

}
