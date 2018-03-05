import {Validator} from "./validator";
import {CpProxy} from "../moduleproxies/cp-proxy";

export class TfvcIsActiveValidator implements Validator {

    private readonly tfPath: string;
    private readonly workspaceRootPath: string;
    private readonly cpProxy: CpProxy;

    constructor(tfPath: string, workspaceRootPath: string, cpProxy?: CpProxy) {
        this.tfPath = tfPath;
        this.workspaceRootPath = workspaceRootPath;
        this.cpProxy = cpProxy || new CpProxy();
    }

    public async validate(): Promise<void> {
        return this.checkIsTfsRepository();
    }

    private async checkIsTfsRepository(): Promise<void> {
        const briefDiffCommand: string = `"${this.tfPath}" diff /noprompt /format:brief /recursive "${this.workspaceRootPath}"`;
        try {
            await this.cpProxy.execAsync(briefDiffCommand);
        } catch (err) {
            throw new Error("Tfs repository was not determined");
        }
    }
}
