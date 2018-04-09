import {HttpRequestData} from "./httprequestdata";
import {Uri, window, workspace, WorkspaceFolder} from "vscode";
import {WorkspaceProxy} from "../moduleproxies/workspace-proxy";
import * as path from "path";
import {FsProxy} from "../moduleproxies/fs-proxy";
import { Logger } from "../utils/logger";

export class HttpHostRequest {

    public static async processRequest(bytes: Uint8Array): Promise<{succeed: boolean, httpVersion: string}> {
        const input: string[] = bytes.toString().trim().split("\n");
        const firstLine: string = input[0];

        const tokens: string[] = firstLine.trim().split(/[\t\r\n\f ]+/);
        if (tokens.length < 3) {
            return {succeed: false, httpVersion: undefined};
        }
        let tokensIndex: number = 1;
        const uri = tokens[tokensIndex++];
        const httpVersion = tokens[tokensIndex];
        const i: number = uri.indexOf("?");
        const path = (i < 0) ? uri : uri.substring(0, i);
        const params = {};
        if (i >= 0) {
            const request = uri.substring(i + 1);
            if (request) {
                console.log(request);
                HttpHostRequest.parseGetRequestParams(decodeURIComponent(request), params);
            }
        }
        const succeed = await HttpHostRequest.fireRequestAccepted(path, params);
        return {succeed: succeed, httpVersion: httpVersion};
    }

    public static parseGetRequestParams(req: string, pars: {}): void {
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

    public static async fireRequestAccepted(resourcePath: string, pars: {}): Promise<boolean> {
        const data: HttpRequestData = new HttpRequestData(resourcePath, pars);
        const workspaceFolders: WorkspaceFolder[] = new WorkspaceProxy().workspaceFolders;
        if (data.isSupportedRequest() && workspaceFolders.length > 0) {
            for (let i = 0; i < workspaceFolders.length; i++) {
                const filePath = path.join(new WorkspaceProxy().workspaceFolders[0].uri.path, data.getFile());
                const uriPath: Uri = Uri.file(filePath);
                if (await new FsProxy().existsAsync(uriPath.fsPath)) {
                    try {
                        await window.showTextDocument(uriPath);
                        return true;
                    } catch (err) {
                        Logger.logWarning(err);
                    }
                }
            }
        }
        return false;
    }
}
