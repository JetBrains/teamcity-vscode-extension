import {DataProvider} from "./dataprovider";
import {Event, EventEmitter, TreeItem} from "vscode";
import {DataProviderEnum} from "../../bll/utils/constants";
import {IBuildSettingsProvider} from "./interfaces/IBuildSettingsProvider";
import {injectable} from "inversify";
import {BuildConfig} from "../../bll/entities/buildconfig";

@injectable()
export class BuildSettingsProvider extends DataProvider implements IBuildSettingsProvider {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

    private build: BuildConfig;

    public getChildren(element?: TreeItem):  TreeItem[] | Thenable<TreeItem[]> {
        if (!element) {
            return this.build.getConfigParameters();
        }
    }

    getType(): DataProviderEnum {
        return DataProviderEnum.BuildSettingsProvider;
    }

    refreshTreePresentation(): void {
        this._onDidChangeTreeData.fire();
    }

    resetTreeContent(): void {
        //
    }

    getCurrentBuild(): BuildConfig {
        return this.build;
    }

    setBuild(buildConfig: BuildConfig): void {
        this.build = buildConfig;
    }
}
