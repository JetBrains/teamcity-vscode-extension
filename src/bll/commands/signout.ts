"use strict";

import {TeamCityStatusBarItem} from "../../view/teamcitystatusbaritem";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {PersistentStorageManager} from "../credentialsstore/persistentstoragemanager";

@injectable()
export class SignOut implements Command {

    private credentialsStore: CredentialsStore;
    private persistentStorageManager: PersistentStorageManager;

    public constructor(@inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore,
                       @inject(TYPES.PersistentStorageManager) persistentStorageManager: PersistentStorageManager) {
        this.credentialsStore = credentialsStore;
        this.persistentStorageManager = persistentStorageManager;
    }

    public async exec(): Promise<void> {
        this.credentialsStore.removeCredentials();
        TeamCityStatusBarItem.setLoggedOut();
        return this.persistentStorageManager.removeCredentials();
    }
}
