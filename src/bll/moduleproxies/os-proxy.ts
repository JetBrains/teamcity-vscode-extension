import * as os from "os";
import {injectable} from "inversify";

@injectable()
export class OsProxy {

    platform(): NodeJS.Platform {
        return os.platform();
    }

    homedir(): string {
        return os.homedir();
    }
}
