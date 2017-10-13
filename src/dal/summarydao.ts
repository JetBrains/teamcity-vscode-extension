"use strict";

import {Summary} from "../bll/entities/summary";

export interface SummaryDao {
    get(): Promise<Summary> ;
}
