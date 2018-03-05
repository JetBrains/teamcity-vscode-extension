import * as path from "path";
import {injectable} from "inversify";

@injectable()
export class PathProxy {

    public dirname(filePath: string): string {
        return path.dirname(filePath);
    }
}
