import {inject, injectable} from "inversify";
import {BuildConfigItem} from "../entities/presentable/buildconfigitem";
import {BuildConfig} from "../entities/buildconfig";
import {TYPES} from "../utils/constants";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {commands, Uri} from "vscode";
import { ChangeItem } from "../entities/presentable/changeitem";
import { Change } from "../entities/change";

@injectable()
export class OpenInBrowser implements Command {

    public constructor(@inject(TYPES.CredentialsStore) private readonly credentialsStore: CredentialsStore) {
        //
    }

    async exec(args?: any[]): Promise<void> {
        if (!args || args.length !== 1 || !(args[0] instanceof BuildConfigItem || args[0] instanceof ChangeItem)) {
            return Promise.reject("Illegal argument");
        }
        const credentials = await this.credentialsStore.getCredentials();
        let targetUrl = "";
        if (args[0] instanceof BuildConfigItem) {
            const buildConfigItem: BuildConfigItem = args[0];
            const buildConfig: BuildConfig = buildConfigItem.entity;
            targetUrl = `${credentials.serverURL}/viewType.html?buildTypeId=${buildConfig.externalId}`;
        } else if (args[0] instanceof ChangeItem) {
            const changeItem: ChangeItem = args[0];
            const change: Change = changeItem.item;
            targetUrl = `${credentials.serverURL}/viewModification.html?modId=${change.id}&personal=${change.isPersonal}`;
        }

        commands.executeCommand("vscode.open", Uri.parse(targetUrl));
    }
}
