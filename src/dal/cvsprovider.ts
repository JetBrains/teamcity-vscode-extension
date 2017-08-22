"use strict";

import {MappingFileContent} from "../bll/remoterun/mappingfilecontent";
import {CheckInInfo} from "../bll/remoterun/checkininfo";
import {CvsProviderTypes} from "../bll/utils/constants";
import {CvsLocalResource} from "../bll/entities/cvslocalresource";
import {ReadableSet} from "../bll/utils/readableset";

export interface CvsSupportProvider {

    cvsType: CvsProviderTypes;

    /**
     * @return - A promise for array of formatted names of files, that are required for TeamCity remote run.
     */
    getFormattedFileNames(): Promise<string[]>;

    /**
     * This method generates content of the ".teamcity-mappings.properties" file to map local changes to remote.
     * @return content of the ".teamcity-mappings.properties" file
     */
    generateMappingFileContent(): Promise<MappingFileContent>;

    /**
     * This method provides required info for provisioning remote run and post-commit execution.
     * (Only for git) In case of git there are no workItemIds
     * @return CheckInInfo object
     */
    getRequiredCheckInInfo(): Promise<CheckInInfo>;

    /**
     * Commit all staged/changed (at the moment of a post-commit) files with new content.
     * Should user changes them since build config run, it works incorrect.
     * (Only for git) This functionality would work incorrect if user stages additional files since build config run.
     */
    requestForPostCommit();

    /**
     * Sets files for remote run, when user wants to provide them manually.
     */
    setFilesForRemoteRun(resources: CvsLocalResource[]);

    /**
     * For some CVSes staged files and files at the file system aren't the same.
     * If they are not the same this method @returns ReadStream with content of the specified file.
     * Otherwise this method @returns undefined and we can use a content of the file from the file system.
     */
    getStagedFileContentStream(fileAbsPath: string): Promise<ReadableSet> | undefined;
}
