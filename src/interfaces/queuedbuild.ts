"use strict";

export interface QueuedBuild {
    id: string;
    buildTypeId: string;
    state: string;
    personal: boolean;
    href: string;
    webUrl: string;
}
