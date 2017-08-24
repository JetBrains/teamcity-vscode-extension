"use strict";

import {Disposable} from "vscode";
import {CredentialsStore} from "../credentialsstore/credentialsstore";

export interface NotificationWatcher extends Disposable {

    init(credentialStore: CredentialsStore): void;
}
