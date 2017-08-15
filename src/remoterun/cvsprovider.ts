"use strict";

import { CvsLocalResource } from "../entities/leaveitems";
import { CheckinInfo, MappingFileContent } from "../utils/interfaces";

export interface CvsSupportProvider {

    /**
     * @return - A promise for array of formatted names of files, that are required for TeamCity remote run.
     */
    getFormattedFilenames() : Promise<string[]>;

    /**
     * This method generates content of the ".teamcity-mappings.properties" file to map local changes to remote.
     * @return content of the ".teamcity-mappings.properties" file
     */
    generateMappingFileContent() : Promise<MappingFileContent>;

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
     * Sets files for remote run, when user wants to provide them manually.
     */
    setFilesForRemoteRun(resources : CvsLocalResource[]);
}
