"use strict";

import {assert} from "chai";
import * as os from "os";
import {Credentials} from "../../src/bll/credentialsstore/credentials";
import {PersistentStorageManager} from "../../src/bll/credentialsstore/persistentstoragemanager";
import {TestSettings} from "../testsettings";
import {WindowsCredentialStoreApi} from "../../src/bll/credentialsstore/win32/win-credstore-api";
import {WinPersistentCredentialsStore} from "../../src/bll/credentialsstore/win32/win-credstore";
import {LinuxFileApi} from "../../src/bll/credentialsstore/linux/linux-file-api";

suite("PersistentStorageManager - integration test", function () {

    test("should verify store, get, remove credentials for our add-in. Platform specific", async function () {
        try {
            const winPersistentCredentialsStore: WinPersistentCredentialsStore = new WinPersistentCredentialsStore();
            const linuxFileApi: LinuxFileApi = new LinuxFileApi();
            const winStoreApi = new WindowsCredentialStoreApi(winPersistentCredentialsStore);
            const credentialManager: PersistentStorageManager = new PersistentStorageManager(winStoreApi, linuxFileApi, undefined, os);
            rewriteMyReleasePrefix(winPersistentCredentialsStore);
            await credentialManager.setCredentials(TestSettings.url, TestSettings.account, TestSettings.password);
            let credInfo: Credentials = await credentialManager.getCredentials();
            assert.equal(credInfo.serverURL, TestSettings.url);
            assert.equal(credInfo.user, TestSettings.account);
            assert.equal(credInfo.password, TestSettings.password);
            await credentialManager.removeCredentials();
            credInfo = await credentialManager.getCredentials();
            assert.isUndefined(credInfo);
        } catch (err) {
            Promise.reject(err);
        }
    });

    function rewriteMyReleasePrefix(winPersistentCredentialsStore: WinPersistentCredentialsStore): void {
        winPersistentCredentialsStore.setPrefix(TestSettings.persistentCredentialsPrefix);
    }
});
