"use strict";

export interface RemoteBuildServer {

    getGZippedSummary(): Promise<Uint8Array[]>;
    getTotalNumberOfEvents(subscription: string): Promise<number>;

    /**
     * @param filesFromPatch - Changed file paths in particular format. The information is required to create request for suitableBuildConfigIds.
     * @return - array of all suitable Build Config Ids.
     */
    getSuitableConfigurations(filesFromPatch: string[]): Promise<string[]>;

    /**
     * @param suitableConfigurations - array of build configurations. Extension requests all related projects to collect full information
     * about build configurations (including projectNames and buildConfigurationName). The information is required to create label for BuildConfig.
     * @return - array of buildXml
     */
    getRelatedBuilds(suitableConfigurations: string[]): Promise<string[]>;
}
