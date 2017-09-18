"use strict";

import {WebLinks} from "./webLinks";
import {Build} from "../bll/entities/build";
import {TYPES} from "../bll/utils/constants";
import {XmlParser} from "../bll/utils/xmlparser";
import {CredentialsStore} from "../bll/credentialsstore/credentialsstore";
import {inject, injectable} from "inversify";

@injectable()
export class BuildDaoImpl {

    private webLinks: WebLinks;

    constructor(@inject(TYPES.WebLinks) webLinks: WebLinks) {
        this.webLinks = webLinks;
    }

    public init(credentialsStore: CredentialsStore) {
        this.webLinks.init(credentialsStore);
    }

    public async getById(id: number): Promise<Build> {
        const buildXml = await this.webLinks.getBuildInfo(id);
        return await XmlParser.parseRestBuild(buildXml);
    }
}
