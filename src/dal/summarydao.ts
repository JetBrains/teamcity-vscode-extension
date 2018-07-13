import {TYPES} from "../bll/utils/constants";
import {Summary} from "../bll/entities/summary";
import {XmlParser} from "../bll/utils/xmlparser";
import {RemoteBuildServer} from "./remotebuildserver";
import {inject, injectable} from "inversify";
import {Utils} from "../bll/utils/utils";

@injectable()
export class SummaryDao {

    private remoteBuildServer: RemoteBuildServer;
    private xmlParser: XmlParser;

    constructor(@inject(TYPES.RemoteBuildServer) remoteBuildServer: RemoteBuildServer,
                @inject(TYPES.XmlParser) xmlParser: XmlParser) {
        this.remoteBuildServer = remoteBuildServer;
        this.xmlParser = xmlParser;
    }

    public async get(isSilent: boolean = false): Promise<Summary> {
        const gZippedSummary: Uint8Array = await this.remoteBuildServer.getGZippedSummary(isSilent);
        const summeryXmlObj: string = Utils.gzip2Xml(gZippedSummary);
        return this.xmlParser.parseSummary(summeryXmlObj);
    }
}
