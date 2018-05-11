export interface GitParsedStatusRow {
    status: string;
    relativePath: string;
    prevRelativePath?: string;
}
