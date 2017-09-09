"use strict";

import Platform = NodeJS.Platform;

export interface Process {
    platform: Platform;
    env: string[];
}
