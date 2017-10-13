"use strict";

import {Build} from "../bll/entities/build";

export interface BuildDao {
    getById(id: number): Promise<Build> ;
}
