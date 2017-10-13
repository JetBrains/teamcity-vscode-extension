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
    workspace,
    WorkspaceEdit
} from "vscode";
import {Logger} from "./bll/utils/logger";
import {XmlParser} from "./bll/utils/xmlparser";
import {RemoteLogin} from "./dal/remotelogin";
import {PatchSender} from "./bll/remoterun/patchsender";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";
import {RemoteBuildServer} from "./dal/remotebuildserver";
import {Settings} from "./bll/entities/settings";
import {inject, injectable} from "inversify";
import {TYPES} from "./bll/utils/constants";
import {Output} from "./view/output";
import {GetSuitableConfigs} from "./bll/commands/getsuitableconfigs";
import {SelectFilesForRemoteRun} from "./bll/commands/selectfilesforremoterun";
import {RemoteRun} from "./bll/commands/remoterun";
import {SignIn} from "./bll/commands/signin";
import {CvsProviderProxy} from "./dal/cvsproviderproxy";

@injectable()
export class CommandHolder {
    private remoteLogin: RemoteLogin;
    private remoteBuildServer: RemoteBuildServer;
    private credentialsStore: CredentialsStore;
    private output: Output;
    private patchSender: PatchSender;
    private settings: Settings;
    private xmlParser: XmlParser;
    private providerProxy: CvsProviderProxy;

    constructor(@inject(TYPES.RemoteLogin) remoteLogin: RemoteLogin,
                @inject(TYPES.RemoteBuildServer) remoteBuildServer: RemoteBuildServer,
                @inject(TYPES.PatchSender) patchSender: PatchSender,
                @inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore,
                @inject(TYPES.Output) output: Output,
                @inject(TYPES.Settings) settings: Settings,
                @inject(TYPES.XmlParser) xmlParser: XmlParser,
                @inject(TYPES.ProviderProxy) providerProxy: CvsProviderProxy) {
        this.remoteLogin = remoteLogin;
        this.remoteBuildServer = remoteBuildServer;
        this.patchSender = patchSender;
        this.credentialsStore = credentialsStore;
        this.output = output;
        this.settings = settings;
        this.xmlParser = xmlParser;
        this.providerProxy = providerProxy;
    }

    public async signIn(): Promise<void> {
        const signIn: Command = new SignIn(this.remoteLogin, this.credentialsStore, this.settings, this.output);
        return signIn.exec();
    }

    public async selectFilesForRemoteRun() {
        Logger.logInfo("CommandHolderImpl#selectFilesForRemoteRun: starts");
        const cvsProvider: CvsProviderProxy = this.providerProxy;
        const selectFilesForRemoteRun: Command = new SelectFilesForRemoteRun(cvsProvider);
        selectFilesForRemoteRun.exec();
    }

    public async getSuitableConfigs(): Promise<void> {
        const cvsProvider = this.providerProxy;
        const getSuitableConfigs: Command = new GetSuitableConfigs(cvsProvider, this.remoteBuildServer, this.xmlParser);
        return getSuitableConfigs.exec();
    }

    public async remoteRunWithChosenConfigs() {
        Logger.logInfo("CommandHolderImpl#remoteRunWithChosenConfigs: starts");
        const cvsProvider = undefined;
        const remoteRunCommand: Command = new RemoteRun(cvsProvider, this.patchSender);
        return remoteRunCommand.exec();
    }

    public showOutput(): void {
        this.output.show();
    }
}
