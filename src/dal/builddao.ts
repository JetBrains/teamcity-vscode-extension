"use strict";

import {CredentialsStore} from "../bll/credentialsstore/credentialsstore";
import {Build} from "../bll/entities/build";

export interface BuildDao {
    getById(id: number): Promise<Build> ;
}
