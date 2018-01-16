import {injectable} from "inversify";
import Platform = NodeJS.Platform;

@injectable()
export class ProcessProxy {

    public get platform(): Platform {
        return process.platform;
    }

    public get env(): string[] {
        return process.env;
    }

}
