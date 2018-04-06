import {HttpRequestData} from "./httprequestdata";

export class HttpHostRequest {

    public static processRequest(bytes: Uint8Array): {succeed: boolean, httpVersion: string} {
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
        const succeed = HttpHostRequest.fireRequestAccepted(path, params);
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

    public static fireRequestAccepted(path: string, pars: {}): boolean {
        const data: HttpRequestData = new HttpRequestData(path, pars);
        if (data.isValid()) {
            // some logic here
        }
        return false;
    }
}
