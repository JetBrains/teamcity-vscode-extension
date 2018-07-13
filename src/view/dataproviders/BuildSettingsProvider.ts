import {DataProvider} from "./dataprovider";
import {Event, EventEmitter, TreeItem} from "vscode";
import {DataProviderEnum} from "../../bll/utils/constants";
import {IBuildSettingsProvider} from "./interfaces/IBuildSettingsProvider";
import {injectable} from "inversify";
import {BuildConfig} from "../../bll/entities/buildconfig";
import {ParametersSetItem} from "../../bll/entities/presentable/ParametersSetItem";

@injectable()
export class BuildSettingsProvider extends DataProvider implements IBuildSettingsProvider {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

    private build: BuildConfig;
    private configParameters: ParametersSetItem;
    private systemProperties: ParametersSetItem;
    private envVariables: ParametersSetItem;

    public getChildren(element?: TreeItem):  TreeItem[] | Thenable<TreeItem[]> {
        if (!element) {
            return [this.configParameters, this.systemProperties, this.envVariables];
        } else if (element instanceof ParametersSetItem) {
            return element.children;
        } else {
            return [];
        }
    }

    getType(): DataProviderEnum {
        return DataProviderEnum.BuildSettingsProvider;
    }

    refreshTreePresentation(): void {
        if (this.build) {
            this.systemProperties.updateParameters(this.build.getSystemProperties());
            this.configParameters.updateParameters(this.build.getConfigParameters());
            this.envVariables.updateParameters(this.build.getEnvVariables());
        } else {
            this.resetTreeContent();
        }
        this._onDidChangeTreeData.fire();
    }

    resetTreeContent(): void {
        this.systemProperties = new ParametersSetItem("System Properties", []);
        this.configParameters = new ParametersSetItem("Configuration Parameters", []);
        this.envVariables = new ParametersSetItem("Environment Variables", []);
    }

    getCurrentBuild(): BuildConfig {
        return this.build;
    }

    setBuild(build: BuildConfig): void {
        this.build = build;
        this.systemProperties = new ParametersSetItem("System Properties", this.build.getSystemProperties());
        this.configParameters = new ParametersSetItem("Configuration Parameters", this.build.getConfigParameters());
        this.envVariables = new ParametersSetItem("Environment Variables", this.build.getEnvVariables());
    }
}
