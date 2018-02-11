import {Project} from "../../../bll/entities/project";
import {BuildConfigItem} from "../../../bll/entities/buildconfigitem";

export interface IBuildProvider {
    resetTreeContent(): void;

    setContent(projects: Project[]): void;

    getSelectedContent(): BuildConfigItem[];
}
