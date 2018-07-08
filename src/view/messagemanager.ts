import {MessageItem, window} from "vscode";
import {MessageTypes} from "../bll/utils/constants";
import {injectable} from "inversify";

@injectable()
export class MessageManager {

    public async showInfoMessage(messageToDisplay: string, ...messageItems: MessageItem[]): Promise<MessageItem> {
        return MessageManager.showMessage(messageToDisplay, MessageTypes.Info, ...messageItems);
    }

    public async showWarningMessage(messageToDisplay: string, ...messageItems: MessageItem[]): Promise<MessageItem> {
        return MessageManager.showMessage(messageToDisplay, MessageTypes.Warn, ...messageItems);
    }

    public async showErrorMessage(messageToDisplay: string, ...messageItems: MessageItem[]): Promise<MessageItem> {
        return MessageManager.showMessage(messageToDisplay, MessageTypes.Error, ...messageItems);
    }

    private static async showMessage(message: string, type: MessageTypes, ...messageItems: MessageItem[]): Promise<MessageItem> {
        const messageToDisplay: string = `${message}`;
        let chosenItem: MessageItem;
        switch (type) {
            case MessageTypes.Error:
                chosenItem = await window.showErrorMessage(messageToDisplay, ...messageItems);
                break;
            case MessageTypes.Info:
                chosenItem = await window.showInformationMessage(messageToDisplay, {modal: false}, ...messageItems);
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
