import {inject, injectable} from "inversify";
import {BuildSettingsProvider} from "../../view/dataproviders/BuildSettingsProvider";
import {BuildConfig} from "../entities/buildconfig";
import {Parameter} from "../entities/Parameter";
import {VsCodeUtils} from "../utils/vscodeutils";
import {MessageConstants} from "../utils/messageconstants";
import {ParameterType, TYPES} from "../utils/constants";

@injectable()
export class AddBuildParameter implements Command {
    public constructor(@inject(TYPES.BuildSettingsProvider)
                       private readonly buildSettingsProvider: BuildSettingsProvider) {
        //
    }

    async exec(args?: any[]): Promise<void> {
        if (!args || args.length !== 1) {
            return Promise.reject("Illegal arguments");
        }
        const key = await AddBuildParameter.requestKey(args[0]);
        const value = await AddBuildParameter.requestValue(key);

        this.addParameter(new Parameter(key, value));
        this.buildSettingsProvider.refreshTreePresentation();
    }

    private static async requestKey(type: ParameterType): Promise<string> {
        const defaultValue = this.getDefaultValue(type);
        const defaultPrompt = `${MessageConstants.PROVIDE_KEY}`;
        return VsCodeUtils.requestMandatoryFiled( defaultValue, defaultPrompt, false);
    }

    private static getDefaultValue(type: ParameterType) {
        if (type === ParameterType.ConfigParameter) {
            return "";
        } else if (type === ParameterType.SystemProperty) {
            return "system.";
        } else if (type === ParameterType.EnvVariable) {
            return "env.";
        }
    }

    private static async requestValue(key: string): Promise<string> {
        const defaultPrompt = `${MessageConstants.PROVIDE_VALUE_OF_KEY} ( Key: ${key} )`;
        return VsCodeUtils.requestMandatoryFiled("", defaultPrompt, false);
    }

    private addParameter(param: Parameter) {
        const build: BuildConfig = this.buildSettingsProvider.getCurrentBuild();

        if (param.key.startsWith("system.")) {
            build.addParameter(ParameterType.SystemProperty, param);
        } else if (param.key.startsWith("env.")) {
            build.addParameter(ParameterType.EnvVariable, param);
        } else {
            build.addParameter(ParameterType.ConfigParameter, param);
        }
    }

}
