import {inject, injectable} from "inversify";
import {Uri} from "vscode";
import {Settings} from "../../bll/entities/settings";
import {GitIsActiveValidator} from "../../bll/cvsutils/gitisactivevalidator";
import {GitPathFinder} from "../../bll/cvsutils/gitpathfinder";
import {GitProvider} from "../gitprovider";
import {TYPES} from "../../bll/utils/constants";
import {Logger} from "../../bll/utils/logger";
import {Utils} from "../../bll/utils/utils";

@injectable()
export class GitProviderActivator {

    private readonly pathFinder: GitPathFinder;
    private readonly isActiveValidator: GitIsActiveValidator;

    public constructor(@inject(TYPES.Settings) private readonly settings: Settings) {
        this.pathFinder = new GitPathFinder();
        this.isActiveValidator = new GitIsActiveValidator();
    }

    public async tryActivateInPath(workspaceRootPath: Uri): Promise<GitProvider> | undefined {
        const gitPath: string = await this.pathFinder.find();
        try {
            await this.isActiveValidator.validate(workspaceRootPath.fsPath, gitPath);
            return new GitProvider(workspaceRootPath, gitPath);
        } catch (err) {
            Logger.logDebug(Utils.formatErrorMessage(err));
            return undefined;
        }

    }
}
