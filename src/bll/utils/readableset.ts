import * as stream from "stream";

export interface ReadableSet {
    stream: stream.Readable;
    length: number;
}
