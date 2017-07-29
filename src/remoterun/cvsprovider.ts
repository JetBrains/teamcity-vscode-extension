"use strict";
import { CheckinInfo } from "../utils/interfaces";

export interface CvsSupportProvider {

    /**
     * @return - A promise for array of formatted names of files, that are required for TeamCity remote run.
     */
    getFormattedFilenames() : Promise<string[]>;

    /**
     * This method generates content of the ".teamcity-mappings.properties" file to map local changes to remote.
     * @return content of the ".teamcity-mappings.properties" file
     */
    generateConfigFileContent() : Promise<string>;

    /**
     * This method provides required info for provisioning remote run and post-commit execution.
     * (Obly for git) In case of git there are no workItemIds
     * @return CheckinInfo object
     */
    getRequiredCheckinInfo() : Promise<CheckinInfo>;

    /**
     * Commit all staged/changed (at the moment of a post-commit) files with new content.
     * Should user changes them since build config run, it works incorrect.
     * (Only for git) This functionality would work incorrect if user stages additional files since build config run.
     */
    requestForPostCommit();

    /**
     * This method indicates whether the extension is active or not.
     */
    isActive() : Promise<boolean>;
}
