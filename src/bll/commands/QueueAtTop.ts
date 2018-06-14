import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {BuildSettingsProvider} from "../../view/dataproviders/BuildSettingsProvider";
import {BuildConfig} from "../entities/buildconfig";
import {Context} from "../../view/Context";

@injectable()
export class QueueAtTop implements Command {

    public constructor(@inject(TYPES.Context) private readonly context: Context,
                       @inject(TYPES.BuildSettingsProvider)
                       private readonly buildSettingsProvider: BuildSettingsProvider) {
        //
    }

    async exec(args?: any[]): Promise<void> {
        const build: BuildConfig = this.buildSettingsProvider.getCurrentBuild();
        build.invertQueueAtTop();
        this.context.setQueueAtTop(build.shouldQueueAtTop());
    }
}
