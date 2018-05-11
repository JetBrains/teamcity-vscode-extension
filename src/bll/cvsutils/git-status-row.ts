export interface GitParsedStatusRow {
    indexStatus: string;
    workingTreeStatus: string;
    relativePath: string;
    prevRelativePath?: string;
}
