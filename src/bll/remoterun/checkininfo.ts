"use strict";

import {CvsLocalResource} from "../entities/cvslocalresource";

export interface CheckInInfo {
    message: string;
    cvsLocalResources: CvsLocalResource[];
    serverItems: string[];
    workItemIds: number[];
}
