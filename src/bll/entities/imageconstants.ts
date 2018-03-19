import {TimePeriodEnum, UserChangeStatus} from "../utils/constants";
import * as path from "path";

export class ImageConstants {

    public static makeTimePeriodImage(value: TimePeriodEnum, isDark: boolean): string {
        const iconDirPath = path.join(__dirname, "..", "..", "..", "..", "resources", "icons", isDark ? "dark" : "light");
        switch (value) {
            case TimePeriodEnum.Today:
                return path.join(iconDirPath, "timeperiod-today.png");
            case TimePeriodEnum.Yesterday:
                return path.join(iconDirPath, "timeperiod-yesterday.png");
            case TimePeriodEnum.Older:
                return path.join(iconDirPath, "timeperiod-older.png");
            default:
                throw new Error("Illegal argument!");
        }
    }

    public static makeChangesImage(status: UserChangeStatus, isPersonal: boolean = false, isDark: boolean = false): string {
        const iconDirPath = path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "light");
        const personalPrefix = isPersonal ? "personal-" : "";

        switch (status) {
            case UserChangeStatus.CHECKED:
                return path.join(iconDirPath, personalPrefix + "checked.svg");
            case UserChangeStatus.FAILED:
                return path.join(iconDirPath, personalPrefix + "failed.svg");
            case UserChangeStatus.RUNNING_FAILED:
                return path.join(iconDirPath, personalPrefix + "running-failed.svg");
            case UserChangeStatus.RUNNING_SUCCESSFULY:
                return path.join(iconDirPath, personalPrefix + "running-successfuly.svg");
            case UserChangeStatus.PENDING:
                return path.join(iconDirPath, personalPrefix + "pending.svg");
            case UserChangeStatus.CANCELED:
                return path.join(iconDirPath, personalPrefix + "canceled.svg");
            default:
                throw new Error("Illegal argument!");
        }
    }
}
