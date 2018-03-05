import {injectable} from "inversify";
import * as cp from "child_process";
import * as cp_async from "child-process-promise";
import {SpawnOptions} from "child_process";

@injectable()
export class CpProxy {

    public spawn(command: string, args?: string[], options?: SpawnOptions): any {
        return cp.spawn(command, args, options);
    }

    public execFileAsync(file: string, args?: string[]): Promise<any> {
        return cp_async.execFile(file, args);
    }

    public execAsync(path: string): Promise<any> {
        return cp_async.exec(path);
    }

}
