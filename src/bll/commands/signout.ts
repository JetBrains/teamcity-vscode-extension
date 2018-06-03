import {TeamCityStatusBarItem} from "../../view/teamcitystatusbaritem";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {PersistentStorageManager} from "../credentialsstore/persistentstoragemanager";
import {ProviderManager} from "../../view/providermanager";

@injectable()
export class SignOut implements Command {

    private credentialsStore: CredentialsStore;
    private persistentStorageManager: PersistentStorageManager;
    private statusBarItem: TeamCityStatusBarItem;

    public constructor(@inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore,
                       @inject(TYPES.PersistentStorageManager) persistentStorageManager: PersistentStorageManager,
                       @inject(TYPES.TeamCityStatusBarItem) statusBarItem: TeamCityStatusBarItem,
                       @inject(TYPES.ProviderManager) private readonly providerManager: ProviderManager) {
        this.credentialsStore = credentialsStore;
        this.persistentStorageManager = persistentStorageManager;
        this.statusBarItem = statusBarItem;
    }

    public async exec(): Promise<void> {
        this.credentialsStore.removeCredentials();
        this.statusBarItem.setLoggedOut();
        this.providerManager.showEmptyDataProvider();
        return this.persistentStorageManager.removeCredentials();
    }
}
