import {CpProxy} from "../moduleproxies/cp-proxy";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";

@injectable()
export class TfvcIsActiveValidator {

    constructor(@inject(TYPES.CpProxy) private readonly cpProxy: CpProxy) {
        //
    }

    public async validate(workspaceRootPath: string, tfPath: string): Promise<void> {
        // here can be placed more checks
        return this.checkIsTfsRepository(workspaceRootPath, tfPath);
    }

    private async checkIsTfsRepository(workspaceRootPath: string, tfPath: string): Promise<void> {
        const briefDiffCommand: string = `"${tfPath}" diff /noprompt /format:brief /recursive "${workspaceRootPath}"`;
        try {
            await this.cpProxy.execAsync(briefDiffCommand);
        } catch (err) {
            throw new Error("Tfs repository was not determined");
        }
    }
}
