import {Project} from "../../../bll/entities/project";
import {BuildConfig} from "../../../bll/entities/buildconfig";

export interface IBuildProvider {
    resetTreeContent(): void;

    setContent(projects: Project[]): void;

    getSelectedContent(): BuildConfig[];
}
