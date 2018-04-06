import {injectable} from "inversify";
import * as net from "net";
import {Logger} from "../bll/utils/logger";
import {Disposable} from "vscode";

@injectable()
export class WebLinkListener implements Disposable {

    private readonly server;
    private readonly clients: Array<any> = [];
    private static readonly SOCKET_NUMBER_START: number = 63330;
    private static readonly SOCKET_NUMBER_END: number = WebLinkListener.SOCKET_NUMBER_START + 9;
    private static readonly LOOPBACK: string = "127.0.0.1";

    public constructor() {
        this.initListener().catch((err) => {
            Logger.logError(`WebLinkListener#initListener there is an uncaught exception: ${err}`);
        });
    }

    public async initListener(): Promise<void> {
        const server = net.createServer();
        server.on("connection", (socket) => {
            //socket.pipe(socket);
            this.clients.push(socket);
            socket.on("error", function(err) {
                Logger.logWarning(`WebLinkListener#initListener error with socket: ${err}`);
                socket.destroy();
            });
            socket.on("data", function(data) {
                Logger.logDebug(`WebLinkListener#initListener received data: ${data}`);
                socket.destroy();
            });
            socket.on("close", () => {
                Logger.logDebug(`WebLinkListener#initListener socket is closed.`);
            });
        });

        for (let port = WebLinkListener.SOCKET_NUMBER_START; port <= WebLinkListener.SOCKET_NUMBER_END; port++) {
            try {
                await new Promise((resolve, reject) => {
                    server.listen(port, WebLinkListener.LOOPBACK, 10, () => {
                        resolve();
                    });
                    server.on("error", (err) => {
                        reject(err);
                    });
                });
                Logger.logDebug("WebLinkListener#initListener Port is registered on port " + port);
                break;
            } catch (err) {
                Logger.logWarning("WebLinkListener#initListener there is an error " + err);
            }
        }
    }

    public dispose(): any {
        if (this.clients) {
            this.clients.forEach((client) => {
                client.destroy();
            });
        }
        if (this.server) {
            this.server.close();
            this.server.unref();
        }
    }
}
