// The module 'vscode' contains the VS Code extensibility API

import "reflect-metadata";
import * as vscode from "vscode";
import {Constants, ParameterType, TYPES} from "./bll/utils/constants";
import {myContainer} from "./inversify.config";
import {ProjectItem} from "./bll/entities/presentable/projectitem";
import {ExtensionManager} from "./extensionmanager";
import {LeaveSelectableItem} from "./bll/entities/presentable/leaveselectableitem";
import {BuildConfigItem} from "./bll/entities/presentable/buildconfigitem";
import {ParameterItem} from "./bll/entities/presentable/ParameterItem";

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
    context.subscriptions.push(vscode.commands.registerCommand(Constants.PRETESTED_COMMIT_WITH_CONFIGS_COMMAND_NAME, () => extensionManager.commandHolder.preTestedCommit()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SELECT_FILES_COMMAND_NAME, () => extensionManager.commandHolder.selectFilesForRemoteRun()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.REFRESH_SELECTED_FILES_COMMAND_NAME, () => extensionManager.commandHolder.selectFilesForRemoteRun()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SHOW_OUTPUT_COMMAND_NAME, () => extensionManager.commandHolder.showOutput()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.BACK_TO_EMPTY_DATA_PROVIDER_COMMAND_NAME, () => extensionManager.commandHolder.backToEmptyDataProvider()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.BACK_TO_BUILD_EXPLORER_COMMAND_NAME, () => extensionManager.commandHolder.backToBuildExplorer()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.BACK_TO_SELECT_FILES_COMMAND_NAME, () => extensionManager.commandHolder.backToSelectFilesForRemoteRun()));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.SHOW_MY_CHANGES_COMMAND_NAME, () => extensionManager.commandHolder.showMyChanges()));
    context.subscriptions.push(vscode.commands.registerCommand(
        Constants.ADD_CONFIG_PARAMETER_COMMAND_NAME,
        () => extensionManager.commandHolder.addParameter(ParameterType.ConfigParameter)));

    context.subscriptions.push(vscode.commands.registerCommand(
        Constants.ADD_SYSTEM_PROPERTY_COMMAND_NAME,
        () => extensionManager.commandHolder.addParameter(ParameterType.SystemProperty)));

    context.subscriptions.push(vscode.commands.registerCommand(
        Constants.ADD_ENV_VARIABLE_COMMAND_NAME,
        () => extensionManager.commandHolder.addParameter(ParameterType.EnvVariable)));

    context.subscriptions.push(vscode.commands.registerCommand(Constants.CUSTOMIZE_BUILD_COMMAND_NAME, (
        configurable: BuildConfigItem) => extensionManager.commandHolder.customizeBuild(configurable)));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.CHANGE_CONFIG_STATE, (item: LeaveSelectableItem) => {
        item.changeState();
        extensionManager.refreshAllProviders();
    }));
    context.subscriptions.push(vscode.commands.registerCommand(Constants.CHANGE_COLLAPSIBLE_STATE, (project: ProjectItem) => {
        project.changeCollapsibleState();
        extensionManager.refreshAllProviders();
    }));
    context.subscriptions.push(vscode.commands.registerCommand(
        Constants.REMOVE_PARAMETER_COMMAND_NAME,
        (parameter: ParameterItem) => {
            extensionManager.commandHolder.removeParameter(parameter);
        }));
    context.subscriptions.push(vscode.commands.registerCommand(
        Constants.EDIT_PARAMETER_COMMAND_NAME,
        (parameter: ParameterItem) => {
            extensionManager.commandHolder.editParameter(parameter);
        }));
    context.subscriptions.push(vscode.commands.registerCommand(
        Constants.QUEUE_AT_TOP_COMMAND_NAME, () => {
            extensionManager.commandHolder.queueAtTop();
        }));
    context.subscriptions.push(vscode.commands.registerCommand(
        Constants.UNQUEUE_FROM_TOP_COMMAND_NAME, () => {
            extensionManager.commandHolder.queueAtTop();
        }));
    context.subscriptions.push(vscode.commands.registerCommand(
        Constants.OPEN_IN_BROWSER, (buildConfigItem: BuildConfigItem) => {
            extensionManager.commandHolder.openInBrowser(buildConfigItem);
        }));
    context.subscriptions.push(extensionManager);
}
