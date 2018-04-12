import * as xmlrpc from "xmlrpc";
import * as forge from "node-forge";
import {Logger} from "../bll/utils/logger";
import {inject, injectable} from "inversify";
import {RcaPublicKey} from "./rcapublickey";
import {MessageConstants} from "../bll/utils/messageconstants";
import {Utils} from "../bll/utils/utils";
import {TYPES} from "../bll/utils/constants";
import {IVsCodeUtils} from "../bll/utils/ivscodeutils";
import {RequestProxy, RequestResult} from "../bll/moduleproxies/request-proxy";

const BigInteger = forge.jsbn.BigInteger;
const pki = forge.pki;

@injectable()
export class RemoteLogin {

    private readonly vsCodeUtils: IVsCodeUtils;
    private readonly requestProxy: RequestProxy;

    constructor(@inject(TYPES.VsCodeUtils) vsCodeUtils: IVsCodeUtils,
                @inject(TYPES.RequestProxy) requestProxy: RequestProxy) {
        this.vsCodeUtils = vsCodeUtils;
        this.requestProxy = requestProxy;
    }

    async isServerReachable(serverUrl: string): Promise<boolean> {
        const options = {
            url: `${serverUrl}/app/rest/server/version`,
        };
        const requestResult: RequestResult = await this.requestProxy.get(options);
        return !requestResult.err &&
            requestResult.response &&
            requestResult.response.statusCode === 200;
    }

    async authenticate(serverUrl: string, user: string, password: string): Promise<string> {
        const client = this.createClient(serverUrl);
        const rsaPublicKey: RcaPublicKey = await this.getPublicKey(client);
        if (!rsaPublicKey) {
            throw MessageConstants.XMLRPC_AUTH_EXCEPTION + " rsaPublicKey is absent";
        }
        const encPass = rsaPublicKey.encrypt(password);
        const hexEncPass = forge.util.createBuffer(encPass).toHex();
        return new Promise<string>((resolve, reject) => {
            client.methodCall("RemoteAuthenticationServer.authenticate", [user, hexEncPass], (err, data) => {
                /* tslint:disable:no-null-keyword */
                if (err && err.message && err.message.indexOf("Incorrect username or password") !== -1) {
                    Logger.logError("RemoteAuthenticationServer.authenticate: return an error: " + Utils.formatErrorMessage(err));
                    return reject(MessageConstants.STATUS_CODE_401);
                } else if (err !== null) {
                    Logger.logError("RemoteAuthenticationServer.authenticate: return an error: " + Utils.formatErrorMessage(err));
                    return reject(Utils.formatErrorMessage(err));
                }
                /* tslint:enable:no-null-keyword */
                resolve(data);
            });
        });
    }

    public createClient(serverUrl: string): any {
        const headers = {};
        headers["User-Agent"] = this.vsCodeUtils.getUserAgentString();
        return xmlrpc.createClient({url: serverUrl + "/RPC2", cookies: true, headers: headers});
    }

    /**
     * @return - Promise for RSAPublicKey object from node-forge module.
     */
    private getPublicKey(client: any): Promise<RcaPublicKey> {
        if (!client && !client.methodCall) {
            throw Error("Incorrect client!");
        }
        return new Promise<RcaPublicKey>((resolve, reject) => {
            client.methodCall("RemoteAuthenticationServer.getPublicKey", [], (err, data) => {
                /* tslint:disable:no-null-keyword */
                if (err !== null) {
                    Logger.logError(`RemoteAuthenticationServer.getPublicKey: it failed at getting public key: ${Utils.formatErrorMessage(err)}`);
                    return reject(err);
                } else if (!data) {
                    Logger.logError("RemoteAuthenticationServer.getPublicKey: received public key is unexpectedly empty " + new Error().stack);
                    return reject("Received public key is unexpectedly empty");
                }
                /* tslint:enable:no-null-keyword */
                const keys: string[] = Utils.parseValueColonValue(data);
                if (!keys || keys.length !== 2) {
                    return reject("RemoteLogin#getPublicKey: wrong number of arguments");
                }
                const rsaPublicKey: RcaPublicKey = pki.setRsaPublicKey(
                    new BigInteger(keys[0]/* n */, 16),
                    new BigInteger(keys[1]/* e */, 16));
                resolve(rsaPublicKey);
            });
        });
    }
}
