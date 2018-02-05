import {Uri, workspace} from "vscode";

export class WorkspaceProxy {

    public getConfigurationValue<T>(value: string, section?: string, resource?: Uri): T {
        return workspace.getConfiguration(section, resource).get<T>(value);
    }
}
