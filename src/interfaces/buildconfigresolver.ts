"use strict";

import {ProjectItem} from "../entities/projectitem";
import {Credentials} from "../credentialsstore/credentials";

export interface BuildConfigResolver {

    getSuitableBuildConfigs(tcFormattedFilePaths: string[], credentials: Credentials): Promise<ProjectItem[]>;
}
