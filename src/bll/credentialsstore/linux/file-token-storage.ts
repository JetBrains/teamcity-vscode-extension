import {inject, injectable} from "inversify";
import {TYPES} from "../../utils/constants";
import {FsProxy} from "../../moduleproxies/fs-proxy";
import {PathProxy} from "../../moduleproxies/path-proxy";

@injectable()
export class FileTokenStorage {
    private filename: string;
    private fs: FsProxy;
    private path: PathProxy;

    constructor(@inject(TYPES.FsProxy) fs: FsProxy,
                @inject(TYPES.FsProxy) path: PathProxy) {
        this.fs = fs;
        this.path = path;
    }

    public setFilename(filename: string) {
        this.filename = filename;
    }

    public addEntries(newEntries: Array<any>, existingEntries: Array<any>) : Promise<void> {
        const entries: Array<any> = existingEntries.concat(newEntries);
        return this.saveEntries(entries);
    }

    public clear() : Promise<void> {
        return this.saveEntries([]);
    }

    public loadEntries(): Promise<any[]> {
        return this.tryLoadEntries();
    }

    private async tryLoadEntries(): Promise<any[]> {
        try {
            const content: string = await this.fs.readFileAsync(this.filename, {encoding: "utf8", flag: "r"});
            return JSON.parse(content);
        } catch (ex) {
            if (ex.code !== "ENOENT") {
                throw new Error(ex);
            }
            return [];
        }
    }

    public keepEntries(entriesToKeep: Array<any>): Promise<void> {
        return this.saveEntries(entriesToKeep);
    }

    private async saveEntries(entries: Array<any>) : Promise<void> {
        const RW_GRANT_FOR_OWNER_ONLY: number = 384;
        await this.createFolderIfNotExist();
        return this.fs.writeFileAsync(this.filename, JSON.stringify(entries), {
            encoding: "utf8",
            mode: RW_GRANT_FOR_OWNER_ONLY,
            flag: "w"
        });
    }

    private async createFolderIfNotExist(): Promise<void> {
        const folder: string = this.path.dirname(this.filename);
        const isFolderExist: boolean = await this.fs.existsAsync(folder);
        if (!isFolderExist) {
            await this.fs.mkdirAsync(folder);
        }
    }
}
