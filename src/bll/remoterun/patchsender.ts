import {Logger} from "../utils/logger";
import {WebLinks} from "../../dal/weblinks";
import {XmlParser} from "../utils/xmlparser";
import {QueuedBuild} from "../utils/queuedbuild";
import {PatchManager} from "../utils/patchmanager";
import {ChangeListStatus, TYPES} from "../utils/constants";
import {CredentialsStore} from "../credentialsstore/credentialsstore";
import {inject, injectable} from "inversify";
import {Utils} from "../utils/utils";
import {BuildConfig} from "../entities/buildconfig";

@injectable()
export class CustomPatchSender {
    private readonly CHECK_FREQUENCY_MS: number = 10000;
    private readonly webLinks: WebLinks;
    private readonly patchManager: PatchManager;
    private readonly xmlParser: XmlParser;
    private readonly credentialsStore: CredentialsStore;

    constructor(@inject(TYPES.WebLinks) webLinks: WebLinks,
                @inject(TYPES.PatchManager) patchManager: PatchManager,
                @inject(TYPES.XmlParser) xmlParser: XmlParser,
                @inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore) {
        this.webLinks = webLinks;
        this.patchManager = patchManager;
        this.xmlParser = xmlParser;
        this.credentialsStore = credentialsStore;
    }

    public async sendPatch(configs: BuildConfig[], patchAbsPath: string, commitMessage: string): Promise<QueuedBuild[]> {
        await this.checkCredentialsExistence();
        let queuedBuilds: QueuedBuild[] = [];
        try {
            const changeListId = await this.webLinks.uploadChanges(patchAbsPath, commitMessage);
            queuedBuilds = await this.triggerChangeList(changeListId, configs);
        } catch (err) {
            Logger.logError(Utils.formatErrorMessage(err));
            return Promise.reject(Utils.formatErrorMessage(err));
        }
        return queuedBuilds;
    }

    public async waitForChangeFinish(queuedBuilds: QueuedBuild[]): Promise<ChangeListStatus> {
        return this.waitChangeStatusAppearance(queuedBuilds);
    }

    private async checkCredentialsExistence(): Promise<void> {
        await this.credentialsStore.getCredentials();
    }

    private async triggerChangeList(changeListId: string, buildConfigs: BuildConfig[]): Promise<QueuedBuild[]> {
        if (!buildConfigs) {
            return [];
        }
        const queuedBuilds: QueuedBuild[] = [];
        for (let i = 0; i < buildConfigs.length; i++) {
            const build: BuildConfig = buildConfigs[i];
            const queuedBuildInfoXml: string = await this.webLinks.buildQueue(changeListId, build);
            queuedBuilds.push(await this.xmlParser.parseQueuedBuild(queuedBuildInfoXml));
        }
        return queuedBuilds;
    }

    private async waitChangeStatusAppearance(queuedBuilds: QueuedBuild[]): Promise<ChangeListStatus> {
        if (!queuedBuilds) {
            return Promise.resolve<ChangeListStatus>(ChangeListStatus.CHECKED);
        }
        for (let i = 0; i < queuedBuilds.length; i++) {
            const buildStatus: string = await this.waitBuildStatusAppearance(queuedBuilds[i]);
            if (buildStatus !== "SUCCESS") {
                return ChangeListStatus.FAILED;
            }
        }
        return ChangeListStatus.CHECKED;
    }

    private async waitBuildStatusAppearance(build): Promise<string> {
        let buildStatus: string;
        while (!buildStatus) {
            buildStatus = await this.getBuildStatus(build);
            if (!buildStatus) {
                await Utils.sleep(this.CHECK_FREQUENCY_MS);
            }
        }
        return buildStatus;
    }

    private async getBuildStatus(build: QueuedBuild): Promise<string> {
        const buildInfoXml: string = await this.webLinks.getBuildInfo(build.id);
        return this.xmlParser.parseBuildStatus(buildInfoXml);
    }
}
