import {Uri, workspace, WorkspaceConfiguration} from "vscode";

export class WorkspaceProxy {

    public getConfiguration(section?: string, resource?: Uri): WorkspaceConfiguration {
        return workspace.getConfiguration(section, resource);
    }
}
