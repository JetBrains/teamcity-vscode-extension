import Platform = NodeJS.Platform;
import {injectable} from "inversify";

@injectable()
export class ProcessProxy {

    public get platform(): Platform {
        return process.platform;
    }

    public get env(): string[] {
        return process.env;
    }
}
