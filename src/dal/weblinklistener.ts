import {inject, injectable} from "inversify";
import {Logger} from "../bll/utils/logger";
import {Disposable} from "vscode";
import {HttpHostRequest} from "../bll/weblinklistener/httphostrequest";
import {TYPES} from "../bll/utils/constants";
import {Server, Socket, createServer} from "net";
import {Utils} from "../bll/utils/utils";

@injectable()
export class WebLinkListener implements Disposable {

    private readonly server: Server;
    private readonly clients: Array<Socket> = [];
    private static readonly ENCODING = "ascii";
    private static readonly SOCKET_NUMBER_START: number = 63330;
    private static readonly NUMBER_OF_LISTENERS: number = 10;
    private static readonly SOCKET_NUMBER_END: number = WebLinkListener.SOCKET_NUMBER_START + 9;
    private static readonly LOOPBACK: string = "127.0.0.1";

    private static readonly CONTENT_TYPE: Buffer = new Buffer("Content-Type: image/gif\r\n", WebLinkListener.ENCODING);
    private static readonly CONTENT_LENGTH: Buffer = new Buffer("Content-Length: ", WebLinkListener.ENCODING);
    private static readonly HEADER_END: Buffer = new Buffer("\r\n\r\n", WebLinkListener.ENCODING);
    private static readonly CONNECTION_CLOSE: Buffer = new Buffer("Connection: close\r\n", WebLinkListener.ENCODING);
    private static readonly OK: Buffer = new Buffer(" 200 OK\r\n", WebLinkListener.ENCODING);
    private static readonly SERVER: Buffer = new Buffer("Server: Visual Studio Code Activation 1.0\r\n",
                                                        WebLinkListener.ENCODING);

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
        this.server = createServer();
        this.initListener().catch((err) => {
            Logger.logError(`WebLinkListener#initListener: ${err}`);
        });
    }

    public async initListener(): Promise<void> {
        this.prepareServer();

        for (let port = WebLinkListener.SOCKET_NUMBER_START; port <= WebLinkListener.SOCKET_NUMBER_END; port++) {
            Logger.logDebug("WebLinkListener#initListener attempt of registering on port " + port);

            if (await this.checkPortAccessibility(port)) {
                Logger.logInfo("WebLinkListener#initListener Port is registered on port " + port);
                break;
            }
        }
    }

    private prepareServer() {
        this.server.on("connection", (socket: Socket) => {
            this.clients.push(socket);

            socket.on("error", function(err) {
                Logger.logWarning(`WebLinkListener#prepareServer error with socket: ${err}`);
                socket.destroy();
            });

            socket.on("data", (data) => {
                Logger.logDebug(`WebLinkListener#prepareServer received data: ${data}`);
                if (!data) {
                    socket.destroy();
                    return;
                }

                this.httpHostRequest.processRequest(data).then(({succeed, httpVersion}) => {
                    WebLinkListener.writeResponse(socket, succeed, httpVersion);
                    socket.destroy();
                }).catch((err) => {
                    Logger.logError(`WebLinkListener#prepareServer#processRequest: ${Utils.formatErrorMessage(err)}`);
                    socket.destroy();
                });
            });

            socket.on("close", () => {
                Logger.logDebug(`WebLinkListener#initListener: socket is closed.`);
            });
        });
    }

    private async checkPortAccessibility(port: number): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.server.listen(port, WebLinkListener.LOOPBACK, WebLinkListener.NUMBER_OF_LISTENERS, () => {
                resolve(true);
            });
            this.server.on("error", () => {
                resolve(false);
            });
        });
    }

    private static writeResponse(socket: Socket, succeed: boolean, httpVersion: string): void {
        const data: Uint8Array = (succeed) ? this.SUCCESS_STREAM : this.FAILURE_STREAM;
        const responseBuilder: Buffer[] = [];
        responseBuilder.push(new Buffer(httpVersion, WebLinkListener.ENCODING));
        responseBuilder.push(this.OK);
        responseBuilder.push(this.SERVER);
        responseBuilder.push(this.CONNECTION_CLOSE);
        responseBuilder.push(this.CONTENT_TYPE);
        responseBuilder.push(this.CONTENT_LENGTH);
        responseBuilder.push(new Buffer(data.length.toString(), WebLinkListener.ENCODING));
        responseBuilder.push(this.HEADER_END);
        responseBuilder.push(new Buffer(data));
        socket.write(Buffer.concat(responseBuilder));
        socket.end();
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
