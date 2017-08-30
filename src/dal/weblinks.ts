"use strict";

import {BuildConfigItem} from "../bll/entities/buildconfigitem";
import {CredentialsStore} from "../bll/credentialsstore/credentialsstore";

export interface WebLinks {
    init(credentialsStorage: CredentialsStore): void;
    uploadChanges(patchAbsPath: string, message: string): Promise<string>;
    buildQueue(changeListId: string, buildConfig: BuildConfigItem): Promise<string>;
    getBuildInfo(buildId: string | number): Promise<string>;
}
