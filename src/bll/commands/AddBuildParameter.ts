import {inject, injectable} from "inversify";
import {BuildSettingsProvider} from "../../view/dataproviders/BuildSettingsProvider";
import {BuildConfig} from "../entities/buildconfig";
import {Parameter} from "../entities/Parameter";
import {VsCodeUtils} from "../utils/vscodeutils";
import {MessageConstants} from "../utils/messageconstants";
import {TYPES} from "../utils/constants";

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

        const build: BuildConfig = this.buildSettingsProvider.getCurrentBuild();
        const key = await AddBuildParameter.requestKey();
        const value = await AddBuildParameter.requestValue(key);

        const param: Parameter = new Parameter(key, value);
        build.addParameter(args[0], param);
        this.buildSettingsProvider.refreshTreePresentation();
    }

    private static async requestKey(): Promise<string> {
        const defaultPrompt = `${MessageConstants.PROVIDE_KEY}`;
        return VsCodeUtils.requestMandatoryFiled("", defaultPrompt, false);
    }

    private static async requestValue(key: string): Promise<string> {
        const defaultPrompt = `${MessageConstants.PROVIDE_VALUE_OF_KEY} ( Key: ${key} )`;
        return VsCodeUtils.requestMandatoryFiled("", defaultPrompt, false);
    }

}
