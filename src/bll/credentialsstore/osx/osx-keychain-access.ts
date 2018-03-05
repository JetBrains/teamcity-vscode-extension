import {inject, injectable} from "inversify";
import {OsxSecurityParsingStream, OsxSecurityParsingStreamWrapper} from "./osx-keychain-parser";
import {TYPES} from "../../utils/constants";
import {CpProxy} from "../../moduleproxies/cp-proxy";
import {split, mapSync} from "event-stream";

@injectable()
export class OsxKeychain {

    private readonly securityPath: string = "/usr/bin/security";
    private targetNamePrefix: string = "";
    private parser: () => OsxSecurityParsingStream;
    private cp: CpProxy;

    public constructor(@inject(TYPES.OsxSecurityParsingStreamWrapper) wrapper: OsxSecurityParsingStreamWrapper,
                       @inject(TYPES.CpProxy) cp: CpProxy) {
        this.parser = wrapper.parser;
        this.cp = cp;
    }

    public setPrefix(prefix: string) {
        this.targetNamePrefix = prefix;
    }

    public getCredentialsWithoutPasswordsListStream() {
        const securityProcess = this.cp.spawn(this.securityPath, ["dump-keychain"]);
        return securityProcess.stdout
            .pipe(split())
            .pipe(mapSync(function (line) {
                return line.replace(/\\134/g, "\\");
            }))
            .pipe(this.parser());
    }

    public async getPasswordForUser(targetName: string): Promise<string> {
        const args = [
            "find-generic-password",
            "-a", targetName,
            "-s", this.targetNamePrefix,
            "-g"
        ];
        const childProcess = await this.cp.execFileAsync(this.securityPath, args);
        const match = /^password: (?:0x[0-9A-F]+ {2})?"(.*)"$/m.exec(childProcess.stderr);
        if (!match) {
            throw new Error("Password is in invalid format");
        }

        return match[1].replace(/\\134/g, "\\");
    }

    public set(targetName, description, password): Promise<void> {
        const args = [
            "add-generic-password",
            "-a", targetName,
            "-D", description,
            "-s", this.targetNamePrefix,
            "-w", password,
            "-U"
        ];
        return this.cp.execFileAsync(this.securityPath, args);
    }

    public remove(targetName, description): Promise<void> {
        let args = ["delete-generic-password"];
        if (targetName) {
            args = args.concat(["-a", targetName]);
        }
        if (description) {
            args = args.concat(["-D", description]);
        }
        return this.cp.execFileAsync(this.securityPath, args);
    }
}
