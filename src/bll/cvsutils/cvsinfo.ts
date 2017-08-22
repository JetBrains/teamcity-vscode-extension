"use strict";

import {CvsProviderTypes} from "../utils/constants";

export interface CvsInfo {
    cvsType: CvsProviderTypes;
    path: string;
    versionErrorMsg: string;
    isChanged: boolean;
}
