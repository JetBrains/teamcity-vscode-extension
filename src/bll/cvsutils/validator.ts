"use strict";

export interface Validator {
    validate(): Promise<void>;
}
