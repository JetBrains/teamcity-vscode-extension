import {CvsResource} from "../../bll/entities/cvsresources/cvsresource";
import * as path from "path";
import {DeletedCvsResource} from "../../bll/entities/cvsresources/deletedcvsresource";
import {AddedCvsResource} from "../../bll/entities/cvsresources/addedcvsresource";
import {ModifiedCvsResource} from "../../bll/entities/cvsresources/modifiedcvsresource";
import {ReplacedCvsResource} from "../../bll/entities/cvsresources/replacedcvsresource";
import {ITfsWorkFoldInfo} from "./ITfsWorkFoldInfo";
import {GetPrevResourceName} from "./GetPrevResourceName";
import {TfsChangeType} from "./TfsChangeType";

export class BriefDiffRowsParser {
    private static readonly PARSE_BRIEF_DIFF_REGEXP: RegExp = /^(.*)?:\s(.*)$/mg;

    public constructor(private readonly tfPath: string,
                       private readonly tfsInfo: ITfsWorkFoldInfo,
                       private readonly getPrevResourceName: GetPrevResourceName) {
        //
    }

    public async tryParseRows(briefDiffRows: string): Promise<CvsResource[]> {
        const localResources: CvsResource[] = [];

        let match: string[];
        while (match = BriefDiffRowsParser.PARSE_BRIEF_DIFF_REGEXP.exec(briefDiffRows)) {
            if (!BriefDiffRowsParser.isInCorrectFormat(match)) {
                continue;
            }

            const changeType: string = match[1].trim();
            const fileAbsPath: string = match[2].trim();
            const resource: CvsResource = await this.getCvsResource(changeType, fileAbsPath);
            if (resource) {
                localResources.push(resource);
            }
        }
        return localResources;
    }

    private static isInCorrectFormat(match: string[]): boolean {
        return match.length === 3 && match[2] !== "files differ";
    }

    private async getCvsResource(changeType: string, fileAbsPath: string): Promise<CvsResource> {
        const relativePath: string = this.getRelativePath(fileAbsPath);

        if (TfsChangeType.isDeleted(changeType)) {
            return new DeletedCvsResource(fileAbsPath, relativePath, this.getServerFilePath(fileAbsPath));
        } else if (TfsChangeType.isAdded(changeType)) {
            return new AddedCvsResource(fileAbsPath, relativePath, this.getServerFilePath(fileAbsPath));
        } else if (TfsChangeType.isRenamed(changeType)) {
            return this.getRenamedResource(fileAbsPath, changeType);
        } else if (TfsChangeType.isModified(changeType)) {
            return new ModifiedCvsResource(fileAbsPath, relativePath, this.getServerFilePath(fileAbsPath));
        }
    }

    private getRelativePath(fileAbsPath: string) {
        return path.relative(this.tfsInfo.projectLocalPath, fileAbsPath);
    }

    private getServerFilePath(fileAbsPath: string) {
        const relativePath: string = this.getRelativePath(fileAbsPath);
        const serverItems = this.tfsInfo.projectRemotePath + "/" + relativePath;
        return `tfs://${this.tfsInfo.repositoryUrl}${serverItems}`.replace(/\\/g, "/");
    }

    private async getRenamedResource(fileAbsPath: string, changeType: string): Promise<CvsResource | undefined> {
        const relativePath: string = this.getRelativePath(fileAbsPath);
        const prevFileAbsPath: string = await this.getPrevResourceName.execute(fileAbsPath);
        if (prevFileAbsPath === fileAbsPath && TfsChangeType.isModified(changeType)) {
            return new ModifiedCvsResource(fileAbsPath, relativePath, this.getServerFilePath(fileAbsPath));
        } else if (prevFileAbsPath) {
            return new ReplacedCvsResource(fileAbsPath,
                relativePath,
                this.getServerFilePath(fileAbsPath),
                prevFileAbsPath,
                this.getServerFilePath(prevFileAbsPath)
            );
        }
    }
}
