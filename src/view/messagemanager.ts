"use strict";

import {MessageItem, OutputChannel, window} from "vscode";
import {Constants, MessageTypes} from "../bll/utils/constants";

export class MessageManager {

    public static async showInfoMessage(messageToDisplay: string, ...messageItems: MessageItem[]): Promise<MessageItem> {
        return MessageManager.showMessage(messageToDisplay, MessageTypes.Info, ...messageItems);
    }

    public static async showWarningMessage(messageToDisplay: string, ...messageItems: MessageItem[]): Promise<MessageItem> {
        return MessageManager.showMessage(messageToDisplay, MessageTypes.Warn, ...messageItems);
    }

    public static async showErrorMessage(messageToDisplay: string, ...messageItems: MessageItem[]): Promise<MessageItem> {
        return MessageManager.showMessage(messageToDisplay, MessageTypes.Error, ...messageItems);
    }

    private static async showMessage(message: string, type: MessageTypes, ...messageItems: MessageItem[]): Promise<MessageItem> {
        const messageToDisplay: string = `(${Constants.EXTENSION_NAME}) ${message}`;
        let chosenItem: MessageItem;
        switch (type) {
            case MessageTypes.Error:
                chosenItem = await window.showErrorMessage(messageToDisplay, ...messageItems);
                break;
            case MessageTypes.Info:
                chosenItem = await window.showInformationMessage(messageToDisplay, ...messageItems);
                break;
            case MessageTypes.Warn:
                chosenItem = await window.showWarningMessage(messageToDisplay, ...messageItems);
                break;
            default:
                break;
        }
        return chosenItem;
    }
}
