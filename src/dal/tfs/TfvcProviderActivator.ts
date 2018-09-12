import {Logger} from "../../bll/utils/logger";
import {Utils} from "../../bll/utils/utils";
import {UriProxy} from "../../bll/moduleproxies/uri-proxy";
import {Uri} from "vscode";
import {TfvcPathFinder} from "../../bll/cvsutils/tfvcpathfinder";
import {TfvcIsActiveValidator} from "../../bll/cvsutils/tfvcisactivevalidator";
import {TfvcProvider} from "../tfsprovider";
import {inject, injectable} from "inversify";
import {TYPES} from "../../bll/utils/constants";
import {ITfsWorkFoldInfo} from "./ITfsWorkFoldInfo";
import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {GetTfsWorkFoldInfo} from "./GetTfsWorkFoldInfo";

@injectable()
export class TfvcProviderActivator {

    public constructor(@inject(TYPES.CpProxy) private readonly cpProxy: CpProxy,
                       @inject(TYPES.TfvcPathFinder) private readonly tfvcPathFinder: TfvcPathFinder,
                       @inject(TYPES.TfvcIsActiveValidator) private readonly isActiveValidator: TfvcIsActiveValidator) {
        //
    }

    public async tryActivateInPath(workspaceRootPath: UriProxy | Uri): Promise<TfvcProvider> | undefined {
        try {
            const tfPath: string = await this.tfvcPathFinder.find();
            await this.isActiveValidator.validate(workspaceRootPath.fsPath, tfPath);
            const getTfsWorkFoldInfo: GetTfsWorkFoldInfo =
                new GetTfsWorkFoldInfo(workspaceRootPath.fsPath, tfPath, this.cpProxy);
            const tfsInfo: ITfsWorkFoldInfo = await getTfsWorkFoldInfo.execute();

            return new TfvcProvider(workspaceRootPath.fsPath, tfPath, tfsInfo, this.cpProxy);
        } catch (err) {
            Logger.logDebug(Utils.formatErrorMessage(err));
            return undefined;
        }
    }
}
