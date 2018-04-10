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
import {parse as parseUrl} from "url";

@injectable()
export class HttpHostRequest {

    public constructor(@inject(TYPES.WorkspaceProxy) private workspaceProxy: WorkspaceProxy,
                       @inject(TYPES.FsProxy) private fsProxy: FsProxy,
                       @inject(TYPES.UriProxy) private uriProxy: UriProxy,
                       @inject(TYPES.WindowProxy) private windowProxy: WindowProxy) {
    }

    public async processRequest(request: {url?: string, method?: string}): Promise<boolean> {
        if (!request.url) {
            Logger.logWarning("HttpHostRequest#processRequest url is required for processing request");
            return false;
        }

        let path = request.url;
        let params = {};

        const endOfPathIndex: number = request.url.indexOf("?");
        if (endOfPathIndex >= 0) {
            path = request.url.substring(0, endOfPathIndex);
            params = parseUrl(request.url, true).query;
        }

        return await this.fireRequestAccepted(path, params);
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
