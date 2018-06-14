import {ParameterType} from "../utils/constants";
import {Parameter} from "./Parameter";

export class BuildConfig {

    private queueAtTop: boolean = false;
    private parameters: Parameter[][] = [];

    constructor(public readonly id: string, public readonly externalId: string, public readonly name: string) {
        //
    }

    public invertQueueAtTop(): void {
        this.queueAtTop = !this.queueAtTop;
    }

    public shouldQueueAtTop(): boolean {
        return this.queueAtTop;
    }

    public getConfigParameters(): Parameter[] {
        return this.getParameter(ParameterType.ConfigParameter);
    }

    public getSystemProperties(): Parameter[] {
        return this.getParameter(ParameterType.SystemProperty);
    }

    public getEnvVariables(): Parameter[] {
        return this.getParameter(ParameterType.EnvVariable);
    }

    public addParameter(paramType: ParameterType, param: Parameter) {
        if (!this.parameters[paramType]) {
            this.parameters[paramType] = [];
        }
        this.parameters[paramType].push(param);
    }

    public removeParameter(paramType: ParameterType, param: Parameter) {
        if (!this.parameters[paramType]) {
            return;
        }
        const index = this.parameters[paramType].indexOf(param);
        if (index > -1) {
            this.parameters[paramType].splice(index, 1);
        }
    }

    private getParameter(paramType: ParameterType) {
        if (!this.parameters[paramType]) {
            return [];
        }
        return this.parameters[paramType];
    }

    public resetCustomization() {
        this.queueAtTop = false;
        this.parameters = [];
    }
}
