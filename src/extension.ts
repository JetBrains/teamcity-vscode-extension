"use strict";
// The module 'vscode' contains the VS Code extensibility API

import * as vscode from "vscode";
import {ProjectItem} from "./entities/projectitem";
import {ExtensionManager} from "./extensionmanager";
import {BuildConfigTreeDataProvider} from "./remoterun/configexplorer";
import {BuildConfigItem} from "./entities/buildconfigitem";
import {Constants} from "./utils/constants";

let _extensionManager: ExtensionManager;
// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    _extensionManager = new ExtensionManager();
    const configExplorer: BuildConfigTreeDataProvider = new BuildConfigTreeDataProvider();
    _extensionManager.Initialize(configExplorer);
    // The commands have been defined in the package.json file
    // The commandId parameters must match the command fields in package.json
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SIGNIN_COMMAND_NAME, () => _extensionManager.commandHolder.signIn()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SIGNOUT_COMMAND_NAME, () => _extensionManager.commandHolder.signOut()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.REMOTE_RUN_COMMAND_NAME, () => _extensionManager.commandHolder.getSuitableConfigs()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.REMOTE_RUN_WITH_CONFIGS_COMMAND_NAME, () => _extensionManager.commandHolder.remoteRunWithChosenConfigs()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SELECT_FILES_COMMAND_NAME, () => _extensionManager.commandHolder.selectFilesForRemoteRun()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.CHANGE_CONFIG_STATE, (config: BuildConfigItem) => _extensionManager.commandHolder.changeConfigState(config)));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.CHANGE_COLLAPSIBLE_STATE, (config: ProjectItem) => _extensionManager.commandHolder.changeCollapsibleState(config)));
    context.subscriptions.push(vscode.window.registerTreeDataProvider("teamcityExplorer", configExplorer));
    context.subscriptions.push(_extensionManager);
}
