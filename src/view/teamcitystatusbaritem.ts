"use strict";

import {Constants} from "../bll/utils/constants";
import {StatusBarItem, window, Disposable, StatusBarAlignment} from "vscode";
import {injectable} from "inversify";

@injectable()
export class TeamCityStatusBarItem implements Disposable {

    private barItem: StatusBarItem;

    public constructor() {
        this.barItem = window.createStatusBarItem(StatusBarAlignment.Left, 105);
        this.setLoggedOut();
    }

    public setLoggedOut(): void {
        this.barItem.command = Constants.SIGNIN_COMMAND_NAME;
        this.barItem.text = `$(icon octicon-stop)`;
        this.barItem.tooltip = "Logged out";
        this.barItem.show();
    }

    public setLoggedIn(serverURL :string, userName : string): void {
        this.barItem.command = Constants.SHOW_OUTPUT_COMMAND_NAME;
        this.barItem.text = `$(icon octicon-check)`;
        this.barItem.tooltip = `You are logged in to '${serverURL}' as '${userName}'`;
        this.barItem.show();
    }

    dispose(): void {
        if (this.barItem) {
            this.barItem.dispose();
        }
    }
}
