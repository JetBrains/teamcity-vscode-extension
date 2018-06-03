import {ParameterItem} from "./presentable/ParameterItem";
import {ParameterType} from "../utils/constants";

export class BuildConfig {

    private queueAtTop: boolean = false;
    private parameters: ParameterItem[][] = [];

    constructor(public readonly id: string, public readonly externalId: string, public readonly name: string) {
        //
    }

    public invertQueueAtTop(): void {
        this.queueAtTop = !this.queueAtTop;
    }

    public shouldQueueAtTop(): boolean {
        return this.queueAtTop;
    }

    public addConfigParameters(param: ParameterItem) {
        this.addParameter(param, ParameterType.ConfigParameter);
    }

    public getConfigParameters(): ParameterItem[] {
        return this.getParameter(ParameterType.ConfigParameter);
    }

    public addSystemProperties(param: ParameterItem) {
        this.addParameter(param, ParameterType.SystemProperty);
    }

    public getSystemProperties(): ParameterItem[] {
        return this.getParameter(ParameterType.SystemProperty);
    }

    public addEnvVariables(param: ParameterItem) {
        this.addParameter(param, ParameterType.EnvVariable);
    }

    public getEnvVariables(): ParameterItem[] {
        return this.getParameter(ParameterType.EnvVariable);
    }

    private addParameter(param: ParameterItem, paramType: ParameterType) {
        if (!this.parameters[paramType]) {
            this.parameters[paramType] = [];
        }
        this.parameters[paramType].push(param);
    }

    private getParameter(paramType: ParameterType) {
        if (!this.parameters[paramType]) {
            return [];
        }
        return this.parameters[paramType];
    }
}
