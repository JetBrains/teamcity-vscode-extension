import Platform = NodeJS.Platform;

export class ProcessProxy {

    public get platform(): Platform {
        return process.platform;
    }

    public get env(): string[] {
        return process.env;
    }
}
