export class TfsChangeType {
    //All possible status codes: add|branch|delete|edit|lock|merge|rename|source rename|undelete
    private static readonly ADD = "add";
    private static readonly BRANCH = "branch";
    private static readonly DELETE = "delete";
    private static readonly EDIT = "edit";
    private static readonly UNDELETE = "undelete"; //undelete means restore items that were previously deleted
    private static readonly RENAME = "rename";

    public static isDeleted(changeType: string): boolean {
        return changeType.indexOf(TfsChangeType.DELETE) !== -1;
    }

    public static isAdded(changeType: string): boolean {
        return changeType.indexOf(TfsChangeType.ADD) !== -1
            || changeType.indexOf(TfsChangeType.BRANCH) !== -1
            || changeType.indexOf(TfsChangeType.UNDELETE) !== -1;
    }

    public static isRenamed(changeType: string): boolean {
        return changeType.indexOf(TfsChangeType.RENAME) !== -1;
    }

    public static isModified(changeType: string): boolean {
        return changeType.indexOf(TfsChangeType.EDIT) !== -1;
    }
}
