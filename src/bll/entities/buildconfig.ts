export class BuildConfig {
    public readonly id: string;
    public readonly externalId: string;
    public readonly name: string;

    constructor(id: string, externalId: string, name: string) {
        this.id = id;
        this.externalId = externalId;
        this.name = name;
    }
}
