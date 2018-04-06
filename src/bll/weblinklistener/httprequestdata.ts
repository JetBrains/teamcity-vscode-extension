export class HttpRequestData {

    private static readonly BUILD_ID: string = "buildId";
    private static readonly TEST_ID: string = "testId";
    private static readonly SERVER: string = "server";
    private static readonly FILE: string = "file";
    private static readonly TEST_REQUEST: string = "/test";
    private static readonly FILE_REQUEST: string = "/file";

    private readonly path: string;
    private readonly params: {};

    public constructor(path: string, params: {}) {
        this.path = path;
        this.params = params;
    }

    public isValid(): boolean {
        return this.isOpenFileRequest() || this.isOpenTestRequest();
    }

    private isOpenTestRequest(): boolean {
        return HttpRequestData.TEST_REQUEST &&
            this.params[HttpRequestData.BUILD_ID] &&
            this.params[HttpRequestData.TEST_ID] &&
            this.params[HttpRequestData.SERVER];
    }

    private isOpenFileRequest(): boolean {
        return HttpRequestData.FILE_REQUEST && this.params[HttpRequestData.FILE];
    }

    public toString(): string {
        const sb: string[] = [];
        for (const key of Object.keys(this.params)) {
            sb.push(`${key}=${this.params[key]}, `);
        }
        return `RequestData: path=${this.path}[${sb.join()}]`;
    }
}
