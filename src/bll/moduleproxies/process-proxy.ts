import Platform = NodeJS.Platform;
import {injectable} from "inversify";

@injectable()
export class ProcessProxy {

    public get platform(): Platform {
        return process.platform;
    }

    public get env(): { [variable: string]: string } {
        return process.env;
    }
}
