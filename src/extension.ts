'use strict';
// The module 'vscode' contains the VS Code extensibility API

import * as vscode from "vscode";
import { ExtensionManager } from './extensionmanager';
import { BuildConfigTreeDataProvider, BuildConfig } from './remoterun/configexplorer';

let _extensionManager: ExtensionManager;
const SIGNIN_COMMAND_NAME = "teamcity.signIn";
const SIGNOUT_COMMAND_NAME = "teamcity.signOut";
const REMOTE_RUN_COMMAND_NAME = "teamcity.remoteRun";
const MOVE_TO_SECON_PROVIDER = "moveToSecondProvider";
const REMOTE_RUN_WITH_CONFIGS_COMMAND_NAME = "teamcity.configexplorer.remoterun";
// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    _extensionManager = new ExtensionManager();
	const сonfigExplorer : BuildConfigTreeDataProvider = new BuildConfigTreeDataProvider();

    _extensionManager.Initialize(сonfigExplorer);
    // The command has been defined in the package.json file  
    // The commandId parameter must match the command field in package.json
    context.subscriptions.push(_extensionManager);
    context.subscriptions.push(vscode.commands.registerCommand(SIGNIN_COMMAND_NAME, () => _extensionManager.commandHolder.signIn()));
    context.subscriptions.push(vscode.commands.registerCommand(SIGNOUT_COMMAND_NAME, () => _extensionManager.commandHolder.signOut()));
    context.subscriptions.push(vscode.commands.registerCommand(REMOTE_RUN_COMMAND_NAME, () => _extensionManager.commandHolder.remoteRun()));
    context.subscriptions.push(vscode.commands.registerCommand(REMOTE_RUN_WITH_CONFIGS_COMMAND_NAME, () => _extensionManager.commandHolder.remoteRunWithChosenConfigs()));
    context.subscriptions.push(vscode.commands.registerCommand(MOVE_TO_SECON_PROVIDER, (config : BuildConfig) => _extensionManager.commandHolder.moveToSecondProvider(config)));
    context.subscriptions.push(vscode.window.registerTreeDataProvider('сonfigExplorer', сonfigExplorer));
    
}

export function deactivate() {
}