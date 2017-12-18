"use strict";

import {Credentials} from "../src/bll/credentialsstore/credentials";

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

    private static readonly testCredentials = new Credentials(TestSettings.url, TestSettings.account, TestSettings.password, "test", "test");

    public static get credentials(): Credentials {
        return TestSettings.testCredentials;
    }

    public static get persistentCredentialsPrefix(): string {
        return "test_teamcity_vsaddin:";
    }

    public static get win32Platform(): NodeJS.Platform {
        return "win32";
    }

}
