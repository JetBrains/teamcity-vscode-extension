import {TimePeriodEnum} from "../utils/constants";
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
}
