'use strict';
// The module 'vscode' contains the VS Code extensibility API

import * as vscode from 'vscode';
import { ExtensionManager } from './extensionmanager';

let _extensionManager: ExtensionManager;
const SIGNIN_COMMAND_NAME = "teamcity.signIn";
const SIGNOUT_COMMAND_NAME = "teamcity.signOut";
// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    _extensionManager = new ExtensionManager();
    _extensionManager.Initialize();

    // The command has been defined in the package.json file  
    // The commandId parameter must match the command field in package.json
    context.subscriptions.push(_extensionManager);
    context.subscriptions.push(vscode.commands.registerCommand(SIGNIN_COMMAND_NAME, () => _extensionManager.commandHolder.signIn()));
    context.subscriptions.push(vscode.commands.registerCommand(SIGNOUT_COMMAND_NAME, () => _extensionManager.commandHolder.signOut()));
}

export function deactivate() {
}