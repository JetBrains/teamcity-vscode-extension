import {TeamCityStatusBarItem} from "../../view/teamcitystatusbaritem";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {PersistentStorageManager} from "../credentialsstore/persistentstoragemanager";

@injectable()
export class SignOut implements Command {

    public constructor(@inject(TYPES.CredentialsStore) private readonly credentialsStore: CredentialsStore,
                       @inject(TYPES.PersistentStorageManager) private readonly storageManager: PersistentStorageManager,
                       @inject(TYPES.TeamCityStatusBarItem) private readonly statusBarItem: TeamCityStatusBarItem) {
    }

    public async exec(): Promise<void> {
        this.credentialsStore.removeCredentials();
        this.statusBarItem.setLoggedOut();
        return this.storageManager.removeCredentials();
    }
}
