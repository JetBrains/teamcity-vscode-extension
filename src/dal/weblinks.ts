"use strict";

import {QueuedBuild} from "../bll/utils/queuedbuild";
import {BuildConfigItem} from "../bll/entities/buildconfigitem";

export interface WebLinks {
    uploadChanges(patchAbsPath: string, message: string): Promise<string>;
    buildQueue(changeListId: string, buildConfig: BuildConfigItem): Promise<string>;
    getBuildInfo(build: QueuedBuild): Promise<string>;
}
