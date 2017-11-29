"use strict";

import {TeamCityStatusBarItem} from "../../view/teamcitystatusbaritem";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";

@injectable()
export class SignOut implements Command {

    private credentialsStore: CredentialsStore;

    public constructor(@inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore) {
        this.credentialsStore = credentialsStore;
    }

    public async exec(): Promise<void> {
        this.credentialsStore.removeCredentials();
        TeamCityStatusBarItem.setLoggedOut();
    }
}