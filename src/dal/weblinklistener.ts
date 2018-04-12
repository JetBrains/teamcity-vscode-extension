import {inject, injectable} from "inversify";
import {Logger} from "../bll/utils/logger";
import {Disposable} from "vscode";
import {HttpHostRequest} from "../bll/weblinklistener/httphostrequest";
import {TYPES} from "../bll/utils/constants";
import {Server as HttpServer, createServer as createHttpServer} from "http";
import * as portscanner from "portscanner";
import * as pify from "pify";

@injectable()
export class WebLinkListener implements Disposable {

    private server: HttpServer;
    private readonly sockets = {};
    private static readonly SOCKET_NUMBER_START: number = 63330;
    private static readonly SOCKET_NUMBER_END: number = WebLinkListener.SOCKET_NUMBER_START + 9;
    public static readonly SUCCESS_STREAM: Uint8Array = new Uint8Array([
            0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x02, 0x00,
            0x02, 0x00, 0x80, 0xFF, 0x00, 0xFF, 0xFF, 0xFF,
            0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
            0x01, 0x00, 0x3B
        ]);

    public static readonly FAILURE_STREAM: Uint8Array = new Uint8Array([
            0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
            0x01, 0x00, 0x80, 0xFF, 0x00, 0xFF, 0xFF, 0xFF,
            0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
            0x01, 0x00, 0x3B
        ]);

    public constructor(@inject(TYPES.HttpHostRequest) private httpHostRequest: HttpHostRequest) {
       this.initListener().then(() => {
           Logger.logInfo(`WebLinkListener#initListener: listener was successfully attached to the port`);
       }).catch((err) => {
           Logger.logError(`WebLinkListener#initListener: ${err}`);
        });
    }

    private async initListener(): Promise<void> {
        this.server = createHttpServer((request, response) => {
            this.httpHostRequest.processRequest(request).then((succeed) => {
                WebLinkListener.writeResponse(response, succeed);
            });
        });

        let nextSocketId: number = 0;
        this.server.on("connection", (socket) => {
            const socketId = nextSocketId++;
            this.sockets[socketId] = socket;
            socket.on("close", () => {
                delete this.sockets[socketId];
            });
        });

        return this.attachListenerToFreePort(WebLinkListener.SOCKET_NUMBER_START, WebLinkListener.SOCKET_NUMBER_END);
    }

    private static writeResponse(response, succeed: boolean): void {
        const data: Uint8Array = (succeed) ? WebLinkListener.SUCCESS_STREAM : WebLinkListener.FAILURE_STREAM;
        response.statusCode = 200;
        response.setHeader("Content-Type", "image/gif");
        response.setHeader("Connection", "close");
        response.setHeader("Server", "Visual Studio Code Activation 1.0");
        response.setHeader("Content-Length", data.length.toString());
        response.end(new Buffer(data));
    }

    private async attachListenerToFreePort(from: number, to:number): Promise<void> {
        for (let port = from; port <= to; port++) {
            const status = await pify(portscanner.checkPortStatus)(port);
            if (status === "closed" && await this.tryAttachToThePort(port)) {
                return;
            }
        }

        throw new Error("Could not find free port");
    }

    private async tryAttachToThePort(port: number): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.server.on("error", () => {
                resolve(false);
            });
            this.server.listen(port, () => {
                resolve(true);
            });
        });
    }

    public dispose(): any {
        if (this.server) {
            this.server.close();
        }

        for (const socketId of Object.keys(this.sockets)) {
            this.sockets[socketId].destroy();
        }
    }
}
