import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {Logger} from "../../bll/utils/logger";
import {Utils} from "../../bll/utils/utils";
import {CheckInInfo} from "../../bll/entities/checkininfo";

export class TfvcCommitCommand {
    public constructor(private readonly tfPath: string,
                       private readonly cpProxy: CpProxy,
                       private readonly checkInInfo: CheckInInfo) {
        //
    }

    public async execute(): Promise<void> {
        try {
            await this.cpProxy.execAsync(this.getCommand(this.checkInInfo));
        } catch (err) {
            Logger.logError("TfvcCommitCommand: caught an exception during attempt to commit:" +
                Utils.formatErrorMessage(err));
            throw new Error("Caught an exception during attempt to commit");
        }
    }

    private getCommand(checkInInfo: CheckInInfo): string {
        const checkInCommandSB: string[] = [];
        checkInCommandSB.push(`"${this.tfPath}" checkIn /comment:"${checkInInfo.message}" /noprompt `);
        checkInInfo.cvsLocalResources.forEach((localResource) => {
            checkInCommandSB.push(`"${localResource.fileAbsPath}" `);
        });
        return checkInCommandSB.join("");
    }
}
