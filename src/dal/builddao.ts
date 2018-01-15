"use strict";

import {WebLinks} from "./webLinks";
import {Build} from "../bll/entities/build";
import {TYPES} from "../bll/utils/constants";
import {XmlParser} from "../bll/utils/xmlparser";
import {inject, injectable} from "inversify";

@injectable()
export class BuildDao {

    private webLinks: WebLinks;
    private xmlParser: XmlParser;

    constructor(@inject(TYPES.WebLinks) webLinks: WebLinks,
                @inject(TYPES.XmlParser) xmlParser: XmlParser) {
        this.webLinks = webLinks;
        this.xmlParser = xmlParser;
    }

    public async getById(id: number): Promise<Build> {
        const buildXml = await this.webLinks.getBuildInfo(id);
        return await this.xmlParser.parseRestBuild(buildXml);
    }
}
