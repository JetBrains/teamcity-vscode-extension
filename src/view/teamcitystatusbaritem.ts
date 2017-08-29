"use strict";

import {Constants} from "../bll/utils/constants";
import {StatusBarItem, window, Disposable, StatusBarAlignment} from "vscode";

export class TeamCityStatusBarItem {
    private static _item: StatusBarItem;

    public static init(disposables: Disposable[]): void {
        if (TeamCityStatusBarItem._item !== undefined) {
            return;
        }
        TeamCityStatusBarItem._item = window.createStatusBarItem(StatusBarAlignment.Left, 105);
        if (disposables) {
            disposables.push(TeamCityStatusBarItem._item);
        }
        TeamCityStatusBarItem.setLoggedOut();
    }

    public static setLoggedOut(): void {
        TeamCityStatusBarItem._item.command = Constants.SIGNIN_COMMAND_NAME;
        TeamCityStatusBarItem._item.text = `$(icon octicon-stop)`;
        TeamCityStatusBarItem._item.tooltip = "Logged out";
        TeamCityStatusBarItem._item.show();
    }

    public static setLoggedIn(serverURL :string, userName : string): void {
        TeamCityStatusBarItem._item.command = Constants.SHOW_OUTPUT_COMMAND_NAME;
        TeamCityStatusBarItem._item.text = `$(icon octicon-check)`;
        TeamCityStatusBarItem._item.tooltip = `You are logged in to '${serverURL}' as '${userName}'`;
        TeamCityStatusBarItem._item.show();
    }
}
