"use strict";

import {CredentialsStore} from "../bll/credentialsstore/credentialsstore";
import {Summary} from "../bll/entities/summary";

export interface SummaryDao {
    get(): Promise<Summary> ;
}
