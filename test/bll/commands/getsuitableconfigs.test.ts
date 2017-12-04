"use strict";

import {GetSuitableConfigs} from "../../../src/bll/commands/getsuitableconfigs";
import * as tsMockito from "ts-mockito";
import {anything, mock, verify, when} from "ts-mockito";
import {CvsProviderProxy} from "../../../src/dal/cvsproviderproxy";
import {ChangesProvider} from "../../../src/view/dataproviders/resourceprovider";
import {RemoteBuildServer} from "../../../src/dal/remotebuildserver";
import {RemoteBuildServerImpl} from "../../../src/dal/remotebuildserverimpl";
import {XmlParser} from "../../../src/bll/utils/xmlparser";
import {CheckInInfo} from "../../../src/bll/entities/checkininfo";
import {BuildProvider} from "../../../src/view/dataproviders/buildprovider";

suite("Get Suitable Configs", () => {
    test("should verify that we request data from resource provider", function (done) {
        const checkInInfoMock: CheckInInfo = mock(CheckInInfo);
        const checkInInfoSpy: CheckInInfo = tsMockito.instance(checkInInfoMock);
        const mockedProviderProxy: CvsProviderProxy = mock(CvsProviderProxy);
        const providerProxySpy: CvsProviderProxy = tsMockito.instance(mockedProviderProxy);
        const remoteBuildServerMock: RemoteBuildServer = tsMockito.mock(RemoteBuildServerImpl);
        const remoteBuildServerSpy: RemoteBuildServer = tsMockito.instance(remoteBuildServerMock);
        const xmlParserMock: XmlParser = tsMockito.mock(XmlParser);
        const xmlParserSpy: XmlParser = tsMockito.instance(xmlParserMock);
        const mockedResourceProvider: ChangesProvider = tsMockito.mock(ChangesProvider);
        when(mockedResourceProvider.getSelectedContent()).thenReturn([checkInInfoSpy, checkInInfoSpy]);
        const resourceProviderSpy: ChangesProvider = tsMockito.instance(mockedResourceProvider);
        const buildProviderMock: BuildProvider = mock(BuildProvider);
        const buildProviderSpy: BuildProvider = tsMockito.instance(buildProviderMock);

        const testableCommand = new GetSuitableConfigs(providerProxySpy, resourceProviderSpy, buildProviderSpy, remoteBuildServerSpy, xmlParserSpy);
        testableCommand.exec().then(() => {
            verify(mockedResourceProvider.getSelectedContent()).called();
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });

    test("should verify we request data from resource provider but there are no files selected", function (done) {
        const mockedProviderProxy: CvsProviderProxy = mock(CvsProviderProxy);
        const providerProxySpy: CvsProviderProxy = tsMockito.instance(mockedProviderProxy);
        const remoteBuildServerMock: RemoteBuildServer = tsMockito.mock(RemoteBuildServerImpl);
        const remoteBuildServerSpy: RemoteBuildServer = tsMockito.instance(remoteBuildServerMock);
        const xmlParserMock: XmlParser = tsMockito.mock(XmlParser);
        const xmlParserSpy: XmlParser = tsMockito.instance(xmlParserMock);
        const mockedResourceProvider: ChangesProvider = tsMockito.mock(ChangesProvider);
        when(mockedResourceProvider.getSelectedContent()).thenReturn([]);
        const resourceProviderSpy: ChangesProvider = tsMockito.instance(mockedResourceProvider);
        const buildProviderMock: BuildProvider = mock(BuildProvider);
        const buildProviderSpy: BuildProvider = tsMockito.instance(buildProviderMock);
        const testableCommand = new GetSuitableConfigs(providerProxySpy, resourceProviderSpy, buildProviderSpy, remoteBuildServerSpy, xmlParserSpy);
        testableCommand.exec().then(() => {
            done("An exception was expected");
        }).catch(() => {
            done();
        });
    });

    test("should verify that we send any data to remoteBuildServer", function (done) {
        const checkInInfoMock: CheckInInfo = mock(CheckInInfo);
        const checkInInfoSpy: CheckInInfo = tsMockito.instance(checkInInfoMock);
        const mockedProviderProxy: CvsProviderProxy = mock(CvsProviderProxy);
        const providerProxySpy: CvsProviderProxy = tsMockito.instance(mockedProviderProxy);
        const remoteBuildServerMock: RemoteBuildServer = tsMockito.mock(RemoteBuildServerImpl);
        const remoteBuildServerSpy: RemoteBuildServer = tsMockito.instance(remoteBuildServerMock);
        const xmlParserMock: XmlParser = tsMockito.mock(XmlParser);
        const xmlParserSpy: XmlParser = tsMockito.instance(xmlParserMock);
        const mockedResourceProvider: ChangesProvider = tsMockito.mock(ChangesProvider);
        when(mockedResourceProvider.getSelectedContent()).thenReturn([checkInInfoSpy, checkInInfoSpy]);
        const resourceProviderSpy: ChangesProvider = tsMockito.instance(mockedResourceProvider);
        const buildProviderMock: BuildProvider = mock(BuildProvider);
        const buildProviderSpy: BuildProvider = tsMockito.instance(buildProviderMock);
        const testableCommand = new GetSuitableConfigs(providerProxySpy, resourceProviderSpy, buildProviderSpy, remoteBuildServerSpy, xmlParserSpy);

        testableCommand.exec().then(() => {
            verify(remoteBuildServerMock.getSuitableConfigurations(anything())).called();
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });

    test("should verify that we put any data to buildProvider", function (done) {
        const checkInInfoMock: CheckInInfo = mock(CheckInInfo);
        const checkInInfoSpy: CheckInInfo = tsMockito.instance(checkInInfoMock);
        const mockedProviderProxy: CvsProviderProxy = mock(CvsProviderProxy);
        const providerProxySpy: CvsProviderProxy = tsMockito.instance(mockedProviderProxy);
        const remoteBuildServerMock: RemoteBuildServer = tsMockito.mock(RemoteBuildServerImpl);
        const remoteBuildServerSpy: RemoteBuildServer = tsMockito.instance(remoteBuildServerMock);
        const xmlParserMock: XmlParser = tsMockito.mock(XmlParser);
        const xmlParserSpy: XmlParser = tsMockito.instance(xmlParserMock);
        const mockedResourceProvider: ChangesProvider = tsMockito.mock(ChangesProvider);
        when(mockedResourceProvider.getSelectedContent()).thenReturn([checkInInfoSpy, checkInInfoSpy]);
        const resourceProviderSpy: ChangesProvider = tsMockito.instance(mockedResourceProvider);
        const buildProviderMock: BuildProvider = tsMockito.mock(BuildProvider);
        const buildProviderSpy: BuildProvider = tsMockito.instance(buildProviderMock);
        const testableCommand = new GetSuitableConfigs(providerProxySpy, resourceProviderSpy, buildProviderSpy, remoteBuildServerSpy, xmlParserSpy);

        testableCommand.exec().then(() => {
            verify(buildProviderMock.setContent(anything())).called();
            done();
        }).catch((err) => {
            done("There is no reason for error: " + err);
        });
    });
});
