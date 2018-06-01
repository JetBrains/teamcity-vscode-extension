import {BuildConfigItem} from "../entities/presentable/buildconfigitem";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {IProviderManager} from "../../view/iprovidermanager";

@injectable()
export class CustomizeBuild implements Command {

    constructor(@inject(TYPES.ProviderManager) private readonly providerManager: IProviderManager) {
        //
    }

    async exec(args?: any[]): Promise<void> {
        if (!args || args.length !== 1) {
            return Promise.reject("There are no required arguments");
        }
        if (!(args[0] instanceof BuildConfigItem)) {
            return Promise.reject("Illegal argument type");
        }

        const build: BuildConfigItem = args[0];
        this.providerManager.showBuildSettingsProvider(build.entity);
    }
}
