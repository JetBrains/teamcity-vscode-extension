import {TeamCityStatusBarItem} from "../../view/teamcitystatusbaritem";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {PersistentStorageManager} from "../credentialsstore/persistentstoragemanager";
import {Context} from "../../view/Context";

@injectable()
export class SignOut implements Command {

    public constructor(@inject(TYPES.CredentialsStore) private readonly credentialsStore: CredentialsStore,
                       @inject(TYPES.PersistentStorageManager) private readonly storageManager: PersistentStorageManager,
                       @inject(TYPES.TeamCityStatusBarItem) private readonly statusBarItem: TeamCityStatusBarItem,
                       @inject(TYPES.Context) private readonly myContext: Context) {
    }

    public async exec(): Promise<void> {
        this.credentialsStore.removeCredentials();
        this.statusBarItem.setLoggedOut();
        this.myContext.setSignIn(false);
        return this.storageManager.removeCredentials();
    }
}
