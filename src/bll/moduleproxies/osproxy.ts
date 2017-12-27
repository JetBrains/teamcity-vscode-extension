"use strict";

import * as os from "os";
import {Os} from "../moduleinterfaces/os";
import {injectable} from "inversify";

@injectable()
export class OsProxy implements Os {

    platform(): NodeJS.Platform {
        return os.platform();
    }

    homedir(): string {
        return os.homedir();
    }
}
