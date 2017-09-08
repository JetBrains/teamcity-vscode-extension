"use strict";

export interface Finder {
    find(): Promise<string>;
}
