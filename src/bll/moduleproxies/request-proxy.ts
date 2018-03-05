import * as request from "request";
import {injectable} from "inversify";

@injectable()
export class RequestProxy {

    public async get(options): Promise<RequestResult> {
        return new Promise<RequestResult>((resolve) => {
            request.get(options, function (err, response, body) {
                resolve({
                    err: err,
                    response: response,
                    body: body
                });
            });
        });
    }
}

export interface RequestResult {
    err: any;
    response: any;
    body: any;
}
