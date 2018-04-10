import {HttpRequestData} from "./httprequestdata";
import {WorkspaceProxy} from "../moduleproxies/workspace-proxy";
import * as path from "path";
import {FsProxy} from "../moduleproxies/fs-proxy";
import {Logger} from "../utils/logger";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {WindowProxy} from "../moduleproxies/window-proxy";
import {UriProxy} from "../moduleproxies/uri-proxy";
import {Utils} from "../utils/utils";

@injectable()
export class HttpHostRequest {

    public constructor(@inject(TYPES.WorkspaceProxy) private workspaceProxy: WorkspaceProxy,
                       @inject(TYPES.FsProxy) private fsProxy: FsProxy,
                       @inject(TYPES.UriProxy) private uriProxy: UriProxy,
                       @inject(TYPES.WindowProxy) private windowProxy: WindowProxy) {
    }

    public async processRequest(bytes: Uint8Array): Promise<{succeed: boolean, httpVersion: string}> {
        const input: string[] = bytes.toString().trim().split("\n");
        const firstLine: string = input[0];
        Logger.logDebug(`HttpHostRequest#processRequest: firstLine is ${firstLine}`);
        const tokens: string[] = firstLine.trim().split(/[\t\r\n\f ]+/);
        if (tokens.length < 3) {
            Logger.logWarning(`HttpHostRequest#processRequest: not enough tokens: ${tokens.join(";")}`);
            return {succeed: false, httpVersion: undefined};
        }

        const uri = tokens[1];
        const httpVersion = tokens[2];
        let path = uri;
        const params = {};

        const endOfPathIndex: number = uri.indexOf("?");
        if (endOfPathIndex >= 0) {
            path = uri.substring(0, endOfPathIndex);
            const request = uri.substring(endOfPathIndex + 1);
            this.parseGetRequestParams(request, params);
        }

        const succeed = await this.fireRequestAccepted(path, params);
        return {succeed: succeed, httpVersion: httpVersion};
    }

    private parseGetRequestParams(encodedURIComponent: string, pars: {}): void {
        if (!encodedURIComponent) {
            return;
        }

        const req = decodeURIComponent(encodedURIComponent);
        const pairs: string[] = req.split("&");
        pairs.forEach((pair) => {
            const s: number = pair.indexOf("=");
            if (s > 0) {
                const key: string = pair.substring(0, s);
                const value: string = pair.substring(s + 1);
                if (key && value) {
                    pars[key] = value;
                }
            }
        });
    }

    private async fireRequestAccepted(resourcePath: string, pars: {}): Promise<boolean> {
        const data: HttpRequestData = new HttpRequestData(resourcePath, pars);
        const workspaceFolders: any[] = this.workspaceProxy.getWorkspaceFolders();
        if (!data.isSupportedRequest() || !workspaceFolders || workspaceFolders.length === 0) {
            Logger.logInfo("HttpHostRequest#fireRequestAccepted: either request not supported either wf.len = 0");
            return false;
        }

        for (let i = 0; i < workspaceFolders.length; i++) {
            const filePath = path.join(workspaceFolders[i].uri.path, data.getFile());
            if (await this.tryShowTextDocument(filePath)) {
                Logger.logDebug(`HttpHostRequest#fireRequestAccepted: ${filePath} is opened!`);
                return true;
            }
            Logger.logDebug(`HttpHostRequest#fireRequestAccepted: attempt of opening ${filePath} has failed`);
        }
        return false;
    }

    private async tryShowTextDocument(filePath: string) {
        const uriPath = this.uriProxy.file(filePath);
        if (await this.fsProxy.existsAsync(uriPath.fsPath)) {
            try {
                await this.windowProxy.showTextDocument(uriPath);
                return true;
            } catch (err) {
                Logger.logError(`HttpHostRequest#tryShowTextDocument: ${uriPath.fsPath} exists ` +
                    `but vscode throws ${Utils.formatErrorMessage(err)}`);
            }
        }
        return false;
    }
}
