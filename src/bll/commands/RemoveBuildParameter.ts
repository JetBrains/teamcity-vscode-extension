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

        const paramItem: ParameterItem = args[0];
        this.removeParameter(paramItem.item);

        this.buildSettingsProvider.refreshTreePresentation();
    }

    private removeParameter(param: Parameter) {
        const build: BuildConfig = this.buildSettingsProvider.getCurrentBuild();

        if (param.key.startsWith("system.")) {
            build.removeParameter(ParameterType.SystemProperty, param);
        } else if (param.key.startsWith("env.")) {
            build.removeParameter(ParameterType.EnvVariable, param);
        } else {
            build.removeParameter(ParameterType.ConfigParameter, param);
        }
    }
}
