"use strict";
import {SummaryDao} from "./summarydao";
import {TYPES} from "../bll/utils/constants";
import {Summary} from "../bll/entities/summary";
import {XmlParser} from "../bll/utils/xmlparser";
import {VsCodeUtils} from "../bll/utils/vscodeutils";
import {RemoteBuildServer} from "./remotebuildserver";
import {CredentialsStore} from "../bll/credentialsstore/credentialsstore";
import {injectable, inject} from "inversify";

@injectable()
export class SummaryDaoImpl implements SummaryDao {

    private remoteBuildServer: RemoteBuildServer;

    constructor(@inject(TYPES.RemoteBuildServer) remoteBuildServer: RemoteBuildServer) {
        this.remoteBuildServer = remoteBuildServer;
    }

    init(credentialsStore: CredentialsStore) {
        this.remoteBuildServer.init(credentialsStore);
    }

    public async get(): Promise<Summary> {
        const gZippedSummary: Uint8Array[] = await this.remoteBuildServer.getGZippedSummary();
        const summeryXmlObj: string = VsCodeUtils.gzip2Xml(gZippedSummary);
        return XmlParser.parseSummary(summeryXmlObj);
    }
}
