import {Logger} from "../../bll/utils/logger";
import {Utils} from "../../bll/utils/utils";
import {UriProxy} from "../../bll/moduleproxies/uri-proxy";
import {Uri} from "vscode";
import {TfvcPathFinder} from "../../bll/cvsutils/tfvcpathfinder";
import {TfvcIsActiveValidator} from "../../bll/cvsutils/tfvcisactivevalidator";
import {TfsWorkFoldInfo, TfvcProvider} from "../tfsprovider";
import {inject, injectable} from "inversify";
import {TYPES} from "../../bll/utils/constants";

@injectable()
export class TfvcProviderActivator {

    public constructor(@inject(TYPES.TfvcPathFinder) private readonly tfvcPathFinder: TfvcPathFinder,
                       @inject(TYPES.TfvcIsActiveValidator) private readonly isActiveValidator: TfvcIsActiveValidator) {
        //
    }

    public async tryActivateInPath(workspaceRootPath: UriProxy | Uri): Promise<TfvcProvider> | undefined {
        try {
            const tfPath: string = await this.tfvcPathFinder.find();
            await this.isActiveValidator.validate(workspaceRootPath.fsPath, tfPath);
            const tfsInfo: TfsWorkFoldInfo = await TfvcProvider.getTfsWorkFoldInfo(tfPath, workspaceRootPath.fsPath);
            return new TfvcProvider(workspaceRootPath.fsPath, tfPath, tfsInfo);
        } catch (err) {
            Logger.logDebug(Utils.formatErrorMessage(err));
            return undefined;
        }
    }
}
