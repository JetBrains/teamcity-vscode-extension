export class TcNotificationStatus {
    static readonly UNKNOWN: TcNotificationStatus = new TcNotificationStatus(0, "UNKNOWN", "#3f3f3f", "");
    static readonly NORMAL: TcNotificationStatus = new TcNotificationStatus(1, "NORMAL", "#3f3f3f", "");
    static readonly WARNING: TcNotificationStatus = new TcNotificationStatus(2, "WARNING", "#C47003", "status_warn");
    static readonly FAILURE: TcNotificationStatus = new TcNotificationStatus(3, "FAILURE", "#e50000", "status_err");
    static readonly ERROR: TcNotificationStatus = new TcNotificationStatus(4, "ERROR", "#e50000", "status_err");

    public constructor(private readonly myPriority: number,
                       private readonly myDebugName: string,
                       private readonly myHtmlColor: string,
                       private readonly myHtmlClass: string) {
        //
    }

    public getPriority(): number {
        return this.myPriority;
    }

    public getText(): string {
        return this.myDebugName === "NORMAL" ? "SUCCESS" : this.myDebugName;
    }

    public getHtmlColor(): string {
        return this.myHtmlColor;
    }

    public getHtmlClass(): string {
        return this.myHtmlClass;
    }

    public isSuccessful(): boolean {
        return this.getPriority() <= TcNotificationStatus.WARNING.getPriority() && this !== TcNotificationStatus.UNKNOWN;
    }

    public isFailed(): boolean {
        return this.getPriority() > TcNotificationStatus.WARNING.getPriority();
    }

    public static getStatus(priority: number): TcNotificationStatus {
        switch (priority) {
            case 1:
                return TcNotificationStatus.NORMAL;
            case 2:
                return TcNotificationStatus.WARNING;
            case 3:
                return TcNotificationStatus.FAILURE;
            case 4:
                return TcNotificationStatus.ERROR;
            default:
                return TcNotificationStatus.UNKNOWN;
        }
    }

    public static getStatusByName(statusName: string): TcNotificationStatus {
        switch (statusName) {
            case TcNotificationStatus.NORMAL.myDebugName:
                return TcNotificationStatus.NORMAL;
            case TcNotificationStatus.WARNING.myDebugName:
                return TcNotificationStatus.WARNING;
            case TcNotificationStatus.FAILURE.myDebugName:
                return TcNotificationStatus.FAILURE;
            case TcNotificationStatus.ERROR.myDebugName:
                return TcNotificationStatus.ERROR;
            default:
                return TcNotificationStatus.UNKNOWN;
        }
    }

    public toString(): string {
        return this.myDebugName;
    }
}
