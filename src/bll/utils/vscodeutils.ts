import {extensions, version, window} from "vscode";
import {Constants} from "./constants";
import {IVsCodeUtils} from "./ivscodeutils";
import {injectable} from "inversify";
import {MessageConstants} from "./messageconstants";

@injectable()
export class VsCodeUtils implements IVsCodeUtils {

    private extensionVersion: string;

    public getUserAgentString(): string {
        this.extensionVersion =
            this.extensionVersion || extensions.getExtension(Constants.EXTENSION_ID).packageJSON.version;
        return `${Constants.VISUAL_STUDIO_CODE}/${version} (TeamCity Integration ${this.extensionVersion})`;
    }

    public static async requestMandatoryFiled(defaultValue: string = "",
                                              basicPrompt: string = "",
                                              isPassword: boolean): Promise<string> {
        let operationWasAborted: boolean = false;
        let fieldWasFilled: boolean = false;
        let fieldValue: string;
        let prompt = basicPrompt;
        const placeHolder = MessageConstants.MANDATORY_FIELD;
        while (!fieldWasFilled && !operationWasAborted) {
            fieldValue = await window.showInputBox({
                value: defaultValue,
                prompt: prompt,
                placeHolder: placeHolder,
                password: isPassword,
                ignoreFocusOut: true
            });
            operationWasAborted = fieldValue === undefined;
            fieldWasFilled = fieldValue !== "";
            prompt = `${MessageConstants.MANDATORY_FIELD} ${basicPrompt}`;
        }

        if (!operationWasAborted) {
            return Promise.resolve<string>(fieldValue);
        } else {
            return Promise.reject(`Mandatory Value was not specified. basicPrompt: ${basicPrompt}`);
        }
    }
}
