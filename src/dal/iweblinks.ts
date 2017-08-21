"use strict";

import {QueuedBuild} from "../interfaces/queuedbuild";
import {BuildConfigItem} from "../entities/buildconfigitem";

export interface IWebLinks {
    uploadChanges(patchAbsPath: string, message: string): Promise<string>;
    buildQueue(changeListId: string, buildConfig: BuildConfigItem): Promise<string>;
    getBuildInfo(build: QueuedBuild): Promise<string>;
}
