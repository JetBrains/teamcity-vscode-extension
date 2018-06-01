import {BuildConfigItem} from "../entities/presentable/buildconfigitem";
import {BuildSettingsProvider} from "../../view/dataproviders/BuildSettingsProvider";
import {window} from "vscode";

export class ConfigureBuild implements Command {

    private buildSettingsProvider = new BuildSettingsProvider();

    constructor() {
        window.registerTreeDataProvider("teamcityBuildSettingsProvider", this.buildSettingsProvider);
    }

    async exec(args?: any[]): Promise<void> {
        if (!args || args.length !== 1) {
            return Promise.reject("There are no required arguments");
        }
        if (!(args[0] instanceof BuildConfigItem)) {
            return Promise.reject("Illegal argument type");
        }

        const build: BuildConfigItem = args[0];
        this.buildSettingsProvider.setContent(build);
        this.buildSettingsProvider.show();
    }
}
