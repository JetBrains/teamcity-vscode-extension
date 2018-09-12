import {Logger} from "../../bll/utils/logger";
import {Utils} from "../../bll/utils/utils";
import {UriProxy} from "../../bll/moduleproxies/uri-proxy";
import {Uri} from "vscode";
import {Finder} from "../../bll/cvsutils/finder";
import {TfvcPathFinder} from "../../bll/cvsutils/tfvcpathfinder";
import {Validator} from "../../bll/cvsutils/validator";
import {TfvcIsActiveValidator} from "../../bll/cvsutils/tfvcisactivevalidator";
import {TfsWorkFoldInfo, TfvcProvider} from "../tfsprovider";

export class TfvcProviderActivator {

    public async tryActivateInPath(workspaceRootPath: UriProxy | Uri): Promise<TfvcProvider> | undefined {
        try {
            const pathFinder: Finder = new TfvcPathFinder();
            const tfPath: string = await pathFinder.find();
            const isActiveValidator: Validator = new TfvcIsActiveValidator(tfPath, workspaceRootPath.fsPath);
            await isActiveValidator.validate();
            const tfsInfo: TfsWorkFoldInfo = await TfvcProvider.getTfsWorkFoldInfo(tfPath, workspaceRootPath.fsPath);
            return new TfvcProvider(workspaceRootPath.fsPath, tfPath, tfsInfo);
        } catch (err) {
            Logger.logDebug(Utils.formatErrorMessage(err));
            return undefined;
        }
    }
}
