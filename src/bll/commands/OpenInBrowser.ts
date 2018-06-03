import {inject, injectable} from "inversify";
import {BuildConfigItem} from "../entities/presentable/buildconfigitem";
import {BuildConfig} from "../entities/buildconfig";
import {TYPES} from "../utils/constants";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {commands, Uri} from "vscode";

@injectable()
export class OpenInBrowser implements Command {

    public constructor(@inject(TYPES.CredentialsStore) private readonly credentialsStore: CredentialsStore) {
        //
    }

    async exec(args?: any[]): Promise<void> {
        if (!args || args.length !== 1 || !(args[0] instanceof BuildConfigItem)) {
            return Promise.reject("Illegal argument");
        }
        const credentials = await this.credentialsStore.getCredentials();

        const buildConfigItem: BuildConfigItem = args[0];
        const buildConfig: BuildConfig = buildConfigItem.entity;

        const targetUrl = `${credentials.serverURL}/viewType.html?buildTypeId=${buildConfig.externalId}`;
        commands.executeCommand("vscode.open", Uri.parse(targetUrl));
    }
}
