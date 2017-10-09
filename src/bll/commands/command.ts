"use strict";

interface Command {
    exec(): Promise<void>;
}
