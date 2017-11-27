"use strict";
// The module 'vscode' contains the VS Code extensibility API

import "reflect-metadata";
import * as vscode from "vscode";
import {Constants, TYPES} from "./bll/utils/constants";
import {myContainer} from "./inversify.config";
import {ProjectItem} from "./bll/entities/projectitem";
import {ExtensionManager} from "./extensionmanager";
import {BuildConfigItem} from "./bll/entities/buildconfigitem";
import {DataProviderManager} from "./view/dataprovidermanager";

// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    const extensionManager: ExtensionManager = myContainer.get<ExtensionManager>(TYPES.ExtensionManager);

    // The commands have been defined in the package.json file
    // The commandId parameters must match the command fields in package.json
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SIGNIN_COMMAND_NAME, () => extensionManager.commandHolder.signIn.exec()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SIGNOUT_COMMAND_NAME, () => extensionManager.cleanUp()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.REMOTE_RUN_COMMAND_NAME, () => extensionManager.commandHolder.getSuitableConfigs.exec()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.REMOTE_RUN_WITH_CONFIGS_COMMAND_NAME, () => extensionManager.commandHolder.remoteRunWithChosenConfigs.exec()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SELECT_FILES_COMMAND_NAME, () => extensionManager.commandHolder.selectFilesForRemoteRun.exec()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SHOW_OUTPUT_COMMAND_NAME, () => extensionManager.commandHolder.showOutput()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.CHANGE_CONFIG_STATE, (config: BuildConfigItem) => {
        config.changeState();
        DataProviderManager.refresh();
    }));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.CHANGE_COLLAPSIBLE_STATE, (project: ProjectItem) => {
        project.changeCollapsibleState();
        DataProviderManager.refresh();
    }));
    context.subscriptions.push(extensionManager);
}
