"use strict";

import {assert} from "chai";
import * as os from "os";
import {Credentials} from "../../src/bll/credentialsstore/credentials";
import {PersistentStorageManager} from "../../src/bll/credentialsstore/persistentstoragemanager";
import {TestSettings} from "../testsettings";
import {WindowsCredentialStoreApi} from "../../src/bll/credentialsstore/win32/win-credstore-api";
import {WinPersistentCredentialsStore} from "../../src/bll/credentialsstore/win32/win-credstore";
import {LinuxFileApi} from "../../src/bll/credentialsstore/linux/linux-file-api";
import {FileTokenStorage} from "../../src/bll/credentialsstore/linux/file-token-storage";
import * as path from "path";
import {OsxKeychainApi} from "../../src/bll/credentialsstore/osx/osx-keychain-api";
import {OsxKeychain} from "../../src/bll/credentialsstore/osx/osx-keychain-access";
import {WinCredStoreParsingStreamWrapper} from "../../src/bll/credentialsstore/win32/win-credstore-parser";
import {OsxSecurityParsingStreamWrapper} from "../../src/bll/credentialsstore/osx/osx-keychain-parser";

suite("PersistentStorageManager - integration test", function () {

    test("should verify store, get, remove credentials for our add-in. Platform specific", async function () {
        try {
            const winParseWrapper: WinCredStoreParsingStreamWrapper = new WinCredStoreParsingStreamWrapper();
            const winPersistentCredentialsStore: WinPersistentCredentialsStore = new WinPersistentCredentialsStore(winParseWrapper);
            const fileTokenStorage: FileTokenStorage = new FileTokenStorage();
            const defaultFilename: string = "secrets.json";
            const defaultFolder: string = ".secrets";
            fileTokenStorage.setFilename(path.join(os.homedir(), defaultFolder, defaultFilename));
            const linuxFileApi: LinuxFileApi = new LinuxFileApi(fileTokenStorage);
            const winStoreApi = new WindowsCredentialStoreApi(winPersistentCredentialsStore);
            const osxParseWrapper: OsxSecurityParsingStreamWrapper = new OsxSecurityParsingStreamWrapper();
            const osxKeychain: OsxKeychain = new OsxKeychain(osxParseWrapper);
            osxKeychain.setPrefix(TestSettings.persistentCredentialsPrefix);
            const osxKeychainApi: OsxKeychainApi = new OsxKeychainApi(osxKeychain);
            const credentialManager: PersistentStorageManager = new PersistentStorageManager(winStoreApi, linuxFileApi, osxKeychainApi, os);
            rewriteMyReleasePrefix(winPersistentCredentialsStore);
            await credentialManager.setCredentials(TestSettings.credentials);
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
