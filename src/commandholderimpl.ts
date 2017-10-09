"use strict";

import {
    Disposable,
    extensions,
    MessageItem,
    OutputChannel,
    QuickDiffProvider,
    QuickPickItem,
    QuickPickOptions,
    scm,
    SourceControlInputBox,
    SourceControlResourceState,
    window,
    workspace,
    WorkspaceEdit
} from "vscode";
import {Logger} from "./bll/utils/logger";
import {XmlParser} from "./bll/utils/xmlparser";
import {VsCodeUtils} from "./bll/utils/vscodeutils";
import {RemoteLogin} from "./dal/remotelogin";
import {PatchSender} from "./bll/remoterun/patchsender";
import {MessageConstants} from "./bll/utils/MessageConstants";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";
import {Credentials} from "./bll/credentialsstore/credentials";
import {RemoteBuildServer} from "./dal/remotebuildserver";
import {CvsSupportProvider} from "./dal/cvsprovider";
import {MessageManager} from "./view/messagemanager";
import {CvsSupportProviderFactory} from "./bll/remoterun/cvsproviderfactory";
import {CommandHolder} from "./commandholder";
import {Settings} from "./bll/entities/settings";
import {inject, injectable} from "inversify";
import {TYPES} from "./bll/utils/constants";
import {Output} from "./view/output";
import {GetSuitableConfigs} from "./bll/commands/getsuitableconfigs";
import {SelectFilesForRemoteRun} from "./bll/commands/selectfilesforremoterun";
import {RemoteRun} from "./bll/commands/remoterun";
import {SignIn} from "./bll/commands/signin";

@injectable()
export class CommandHolderImpl implements CommandHolder {
    private remoteLogin: RemoteLogin;
    private remoteBuildServer: RemoteBuildServer;
    private credentialsStore: CredentialsStore;
    private output: Output;
    private patchSender: PatchSender;
    private settings: Settings;
    private xmlParser: XmlParser;
    private cvsSupportProviderFactory: CvsSupportProviderFactory;

    constructor(@inject(TYPES.RemoteLogin) remoteLogin: RemoteLogin,
                @inject(TYPES.RemoteBuildServer) remoteBuildServer: RemoteBuildServer,
                @inject(TYPES.PatchSender) patchSender: PatchSender,
                @inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore,
                @inject(TYPES.Output) output: Output,
                @inject(TYPES.Settings) settings: Settings,
                @inject(TYPES.XmlParser) xmlParser: XmlParser,
                @inject(TYPES.CvsProviderFactory) cvsSupportProviderFactory: CvsSupportProviderFactory) {
        this.remoteLogin = remoteLogin;
        this.remoteBuildServer = remoteBuildServer;
        this.patchSender = patchSender;
        this.credentialsStore = credentialsStore;
        this.output = output;
        this.settings = settings;
        this.xmlParser = xmlParser;
        this.cvsSupportProviderFactory = cvsSupportProviderFactory;
    }

    public async signIn(): Promise<boolean> {
        try {
            const signIn: Command = new SignIn(this.remoteLogin, this.credentialsStore, this.settings, this.output);
            await signIn.exec();
        } catch (err) {
            return false;
        }
        return true;
    }

    public async selectFilesForRemoteRun() {
        Logger.logInfo("CommandHolderImpl#selectFilesForRemoteRun: starts");
        const cvsProvider = await this.getCvsSupportProvider();
        const selectFilesForRemoteRun: Command = new SelectFilesForRemoteRun(cvsProvider);
        selectFilesForRemoteRun.exec();
    }

    public async getSuitableConfigs(): Promise<void> {
        const cvsProvider = await this.getCvsSupportProvider();
        const credentials: Credentials = await this.tryGetCredentials();
        if (credentials === undefined) {
            //If there are no credentials, log already contains message about the problem
            return;
        }
        const getSuitableConfigs: Command = new GetSuitableConfigs(cvsProvider, this.remoteBuildServer, this.xmlParser);
        return getSuitableConfigs.exec();
    }

    public async remoteRunWithChosenConfigs() {
        Logger.logInfo("CommandHolderImpl#remoteRunWithChosenConfigs: starts");
        const credentials: Credentials = await this.tryGetCredentials();
        if (!credentials) {
            Logger.logWarning("CommandHolderImpl#remoteRunWithChosenConfigs: credentials absent. Try to sign in again");
            return;
        }
        const cvsProvider = await this.getCvsSupportProvider();
        const remoteRunCommand: Command = new RemoteRun(cvsProvider, this.patchSender);
        return remoteRunCommand.exec();
    }

    public showOutput(): void {
        this.output.show();
    }

    private async tryGetCredentials(): Promise<Credentials> {
        let credentials: Credentials = this.credentialsStore.getCredential();
        if (!credentials) {
            Logger.logInfo("CommandHolderImpl#tryGetCredentials: credentials is undefined. An attempt to get them");
            await this.signIn();
            credentials = this.credentialsStore.getCredential();
            if (!credentials) {
                MessageManager.showErrorMessage(MessageConstants.NO_CREDENTIALS_RUN_SIGNIN);
                Logger.logWarning("CommandHolderImpl#tryGetCredentials: An attempt to get credentials failed");
                return undefined;
            }
        }
        Logger.logInfo("CommandHolderImpl#tryGetCredentials: success");
        return credentials;
    }

    private async getCvsSupportProvider(): Promise<CvsSupportProvider> {
        const cvsProviders: CvsSupportProvider[] = await this.cvsSupportProviderFactory.getCvsSupportProviders();
        if (!cvsProviders || cvsProviders.length === 0) {
            //If there is no provider, log already contains message about the problem
            Logger.logInfo("No one cvs was found");
            return Promise.reject<CvsSupportProvider>(undefined);
        } else if (cvsProviders.length === 1) {
            Logger.logInfo(`${cvsProviders[0].cvsType.toString()} cvsProvider was found`);
            return cvsProviders[0];
        } else if (cvsProviders.length > 1) {
            const choices: QuickPickItem[] = [];
            cvsProviders.forEach((cvsProvider) => {
                Logger.logInfo(`Several cvsProviders were found:`);
                choices.push({label: cvsProvider.cvsType.toString(), description: cvsProvider.cvsType.toString()});
                Logger.logInfo(`${cvsProvider.cvsType.toString()} cvsProvider was found`);
            });
            const SEVERAL_CVS_DETECTED = "Several CSV were detected. Please specify which should be selected.";
            const options: QuickPickOptions = {
                ignoreFocusOut: true,
                matchOnDescription: false,
                placeHolder: SEVERAL_CVS_DETECTED
            };
            const selectedCvs: QuickPickItem = await window.showQuickPick(choices, options);
            if (!selectedCvs) {
                Logger.logWarning(`Cvs Provider was not specified!`);
                throw new Error("Cvs Provider was not specified!");
            } else {
                for (let i = 0; i < cvsProviders.length; i++) {
                    const cvsProvider = cvsProviders[i];
                    if (cvsProvider.cvsType.toString() === selectedCvs.label) {
                        Logger.logInfo(`${cvsProvider.cvsType.toString()} cvsProvider was selected`);
                        return Promise.resolve<CvsSupportProvider>(cvsProvider);
                    }
                }
                throw new Error("Cvs Provider was not specified!");
            }
        }
    }
}
