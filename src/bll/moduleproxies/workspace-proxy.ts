import {Uri, workspace, WorkspaceFolder} from "vscode";
import {injectable} from "inversify";

@injectable()
export class WorkspaceProxy {

    public getConfigurationValue<T>(value: string, section?: string, resource?: Uri): T {
        return workspace.getConfiguration(section, resource).get<T>(value);
    }

    public get workspaceFolders(): WorkspaceFolder[] | undefined {
        return workspace.workspaceFolders;
    }

    public getWorkspaceFolders(): WorkspaceFolder[] | undefined {
        return workspace.workspaceFolders;
    }

}
