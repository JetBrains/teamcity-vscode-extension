import {BuildConfig} from "./buildconfig";

export class Project {
    public readonly children = [];
    public readonly id: string;
    public readonly parentId: undefined | string;
    public readonly name: string;

    constructor(id: string, parentId: string, name: string) {
        this.id = id;
        this.parentId = parentId;
        this.name = name;
    }

    public addChildBuildConfig(project: BuildConfig) {
        this.children.push(project);
    }

    public addChildProject(project: Project) {
        this.children.push(project);
    }
}
