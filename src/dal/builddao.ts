"use strict";

import {CredentialsStore} from "../bll/credentialsstore/credentialsstore";
import {Build} from "../bll/entities/build";

export interface BuildDao {
    init(credentialsStore: CredentialsStore);
    getById(id: number): Promise<Build> ;
}
