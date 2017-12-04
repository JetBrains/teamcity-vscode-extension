"use strict";

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

    public static get persistentCredentialsPrefix(): string {
        return "test_teamcity_vsaddin:";
    }

    public static get win32Platform(): NodeJS.Platform {
        return "win32";
    }

}
