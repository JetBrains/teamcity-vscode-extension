"use strict";

import {QueuedBuild} from "../interfaces/queuedbuild";
import {BuildConfigItem} from "../entities/buildconfigitem";

export interface WebLinks {
    uploadChanges(patchAbsPath: string, message: string): Promise<string>;
    buildQueue(changeListId: string, buildConfig: BuildConfigItem): Promise<string>;
    getBuildInfo(build: QueuedBuild): Promise<string>;
}
