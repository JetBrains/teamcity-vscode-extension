import {inject, injectable} from "inversify";
import {BuildSettingsProvider} from "../../view/dataproviders/BuildSettingsProvider";
import {BuildConfig} from "../entities/buildconfig";
import {Parameter} from "../entities/Parameter";
import {ParameterType, TYPES} from "../utils/constants";
import {ParameterItem} from "../entities/presentable/ParameterItem";

@injectable()
export class RemoveBuildParameter implements Command {
    public constructor(@inject(TYPES.BuildSettingsProvider)
                       private readonly buildSettingsProvider: BuildSettingsProvider) {
        //
    }

    async exec(args?: any[]): Promise<void> {
        if (!args || args.length !== 1 || !(args[0] instanceof ParameterItem)) {
            return Promise.reject("Illegal arguments");
        }

        const build: BuildConfig = this.buildSettingsProvider.getCurrentBuild();
        const paramItem: ParameterItem = args[0];
        const param: Parameter = paramItem.item;

        build.removeParameter(ParameterType.SystemProperty, param);
        build.removeParameter(ParameterType.ConfigParameter, param);
        build.removeParameter(ParameterType.EnvVariable, param);

        this.buildSettingsProvider.refreshTreePresentation();
    }
}
