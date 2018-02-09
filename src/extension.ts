"use strict";
// The module 'vscode' contains the VS Code extensibility API

import "reflect-metadata";
import * as vscode from "vscode";
import {Constants, TYPES} from "./bll/utils/constants";
import {myContainer} from "./inversify.config";
import {ProjectItem} from "./bll/entities/projectitem";
import {ExtensionManager} from "./extensionmanager";
import {LeaveSelectableItem} from "./bll/entities/leaveselectableitem";

// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    const extensionManager: ExtensionManager = myContainer.get<ExtensionManager>(TYPES.ExtensionManager);

    // The commands have been defined in the package.json file
    // The commandId parameters must match the command fields in package.json
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SIGNIN_COMMAND_NAME, () => extensionManager.commandHolder.signIn()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SIGNOUT_COMMAND_NAME, () => extensionManager.commandHolder.signOut()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.FIND_SUITABLE_CONFIGS_COMMAND_NAME, () => extensionManager.commandHolder.getSuitableConfigs()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.REFRESH_SUITABLE_CONFIGS_COMMAND_NAME, () => extensionManager.commandHolder.getSuitableConfigs()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.REMOTE_RUN_WITH_CONFIGS_COMMAND_NAME, () => extensionManager.commandHolder.remoteRunWithChosenConfigs()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SELECT_FILES_COMMAND_NAME, () => extensionManager.commandHolder.selectFilesForRemoteRun()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.REFRESH_SELECTED_FILES_COMMAND_NAME, () => extensionManager.commandHolder.selectFilesForRemoteRun()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SHOW_OUTPUT_COMMAND_NAME, () => extensionManager.commandHolder.showOutput()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.BACK_TO_EMPTY_DATA_PROVIDER_COMMAND_NAME, () => extensionManager.commandHolder.backToEmptyDataProvider()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.BACK_TO_SELECT_FILES_COMMAND_NAME, () => extensionManager.commandHolder.backToSelectFilesForRemoteRun()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SHOW_MY_CHANGES_COMMAND_NAME, () => extensionManager.commandHolder.showMyChanges()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.CHANGE_CONFIG_STATE, (item: LeaveSelectableItem) => {
        item.changeState();
        extensionManager.refreshAllProviders();
    }));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.CHANGE_COLLAPSIBLE_STATE, (project: ProjectItem) => {
        project.changeCollapsibleState();
        extensionManager.refreshAllProviders();
    }));
    context.subscriptions.push(extensionManager);
}
