import {DataProvider} from "./dataprovider";
import {Event, EventEmitter, TreeItem} from "vscode";
import {DataProviderEnum} from "../../bll/utils/constants";
import {ParameterItem} from "../../bll/entities/presentable/ParameterItem";
import {BuildConfigItem} from "../../bll/entities/presentable/buildconfigitem";

export class BuildSettingsProvider extends DataProvider {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

    private readonly parameters: ParameterItem[] = [];

    public getChildren(element?: TreeItem):  TreeItem[] | Thenable<TreeItem[]> {
        if (!element) {
            return this.parameters;
        }
    }

    getType(): DataProviderEnum {
        return DataProviderEnum.BuildSettingsProvider;
    }

    refreshTreePresentation(): void {
        this._onDidChangeTreeData.fire();
    }

    public setContent(build: BuildConfigItem): void {
        this.resetTreeContent();
        //build.getConfigParameters();
        //build.getSystemProperties();
        //build.getEnvVariables();
    }

    resetTreeContent(): void {
        //
    }
}
