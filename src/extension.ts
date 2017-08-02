"use strict";
// The module 'vscode' contains the VS Code extensibility API

import * as vscode from "vscode";
import { ExtensionManager } from "./extensionmanager";
import { BuildConfigTreeDataProvider, ProjectItem, BuildConfigItem } from "./remoterun/configexplorer";

let _extensionManager: ExtensionManager;
const SIGNIN_COMMAND_NAME = "teamcity.signIn";
const SIGNOUT_COMMAND_NAME = "teamcity.signOut";
const REMOTE_RUN_COMMAND_NAME = "teamcity.remoteRun";
const CHANGE_CONFIG_STATE = "changeConfigState";
const CHANGE_COLLAPSIBLE_STATE = "changeCollapsibleState";
const REMOTE_RUN_WITH_CONFIGS_COMMAND_NAME = "teamcity.configexplorer.remoterun";
// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    _extensionManager = new ExtensionManager();
    const configExplorer : BuildConfigTreeDataProvider = new BuildConfigTreeDataProvider();
    _extensionManager.Initialize(configExplorer);
    // The commands have been defined in the package.json file
    // The commandId parameters must match the command fields in package.json
    context.subscriptions.push(vscode.commands.registerCommand(SIGNIN_COMMAND_NAME, () => _extensionManager.commandHolder.signIn()));
    context.subscriptions.push(vscode.commands.registerCommand(SIGNOUT_COMMAND_NAME, () => _extensionManager.commandHolder.signOut()));
    context.subscriptions.push(vscode.commands.registerCommand(REMOTE_RUN_COMMAND_NAME, () => _extensionManager.commandHolder.getSuitableConfigs()));
    context.subscriptions.push(vscode.commands.registerCommand(REMOTE_RUN_WITH_CONFIGS_COMMAND_NAME, () => _extensionManager.commandHolder.remoteRunWithChosenConfigs()));
    context.subscriptions.push(vscode.commands.registerCommand(CHANGE_CONFIG_STATE, (config : BuildConfigItem) => _extensionManager.commandHolder.changeConfigState(config)));
    context.subscriptions.push(vscode.commands.registerCommand(CHANGE_COLLAPSIBLE_STATE, (config : ProjectItem) => _extensionManager.commandHolder.changeCollapsibleState(config)));
    context.subscriptions.push(vscode.window.registerTreeDataProvider("configExplorer", configExplorer));
    context.subscriptions.push(_extensionManager);
}
