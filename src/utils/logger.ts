"use strict";

import * as winston from "winston";
import * as path from "path";

export class Logger {
    private static initialized: boolean = false;
    private static loggingLevel: LoggingLevel;
    private static logPath: string = "";

    private static initalize() {
        //Only initialize the logger if a logging level is set (in settings) and we haven't initialized it yet
        if (Logger.loggingLevel !== undefined && Logger.initialized === false) {
            const fileOpt:winston.FileTransportOptions =  { json: false, filename: path.join(Logger.logPath, "teamcity-extension.log"),
                                                            level: LoggingLevel[Logger.loggingLevel].toLowerCase(), maxsize: 4000000,
                                                            maxFiles: 5, tailable: false };
            winston.add(winston.transports.File, fileOpt);
            winston.remove(winston.transports.Console);
            Logger.initialized = true;
        }
    }

    public static logDebug(message: string) : void {
        Logger.initalize();
        if (Logger.initialized === true && this.loggingLevel === LoggingLevel.Debug) {
            winston.log("debug", this.addPid(message));
            console.log(Logger.getNow() + message);
        }
    }

    //Logs message to console and winston logger
    public static logError(message: string) : void {
        Logger.initalize();
        if (Logger.initialized === true && this.loggingLevel >= LoggingLevel.Error) {
            winston.log("error", this.addPid(message));
            console.log(Logger.getNow() + "ERROR: " + message);
        }
    }

    public static logInfo(message: string) : void {
        Logger.initalize();
        if (Logger.initialized === true && this.loggingLevel >= LoggingLevel.Info) {
            winston.log("info", " " + this.addPid(message));
            console.log(Logger.getNow() + message);
        }
    }

    public static LogObject(object: any) : void {
        Logger.initalize();
        if (Logger.initialized === true && this.loggingLevel === LoggingLevel.Debug) {
            winston.log("debug", object);
            console.log(object);
        }
    }

    //Logs message to console and displays Warning message
    public static logWarning(message: string) : void {
        Logger.initalize();
        if (Logger.initialized === true && this.loggingLevel >= LoggingLevel.Warn) {
            winston.log("warn", " " + this.addPid(message));
            console.log(Logger.getNow() + "WARNING: " + message);
        }
    }

    public static get LogPath(): string {
        return Logger.logPath;
    }

    public static set LogPath(path: string) {
        if (path !== undefined) {
            Logger.logPath = path;
        }
    }

    public static get LoggingLevel(): LoggingLevel {
        return Logger.loggingLevel;
    }

    public static SetLoggingLevel(level: string): void {
        if (level === undefined) {
            Logger.loggingLevel = undefined;
            return;
        }

        switch (level.toLowerCase()) {
            case "error":
                Logger.loggingLevel = LoggingLevel.Error;
                break;
            case "warn":
                Logger.loggingLevel = LoggingLevel.Warn;
                break;
            case "info":
                Logger.loggingLevel = LoggingLevel.Info;
                break;
            case "verbose":
                Logger.loggingLevel = LoggingLevel.Verbose;
                break;
            case "debug":
                Logger.loggingLevel = LoggingLevel.Debug;
                break;
            default:
                Logger.loggingLevel = undefined;
                break;
        }
    }

    private static getNow(): string {
        const now: Date = new Date();
        const strDateTime: string = [[Logger.addZero(now.getHours()), Logger.addZero(now.getMinutes()), Logger.addZero(now.getSeconds())].join(":"),
                                        Logger.addZero(now.getMilliseconds(), 100)].join(".");

        return strDateTime + " ";
    }

    private static addPid(message: string): string {
        return " [" + Logger.addZero(process.pid, 10000) + "] " + message;
    }

    /**
     * Adds a preceding zero if num is less than base (or the default of 10).
     */
    private static addZero(num: number, base?: number): string {
        let val: number = base;
        if (val === undefined) { val = 10; }
        return (num >= 0 && num < val) ? "0" + num.toString() :  num.toString() + "";
    }
}

export enum LoggingLevel {
    Error = 0,
    Warn = 1,
    Info = 2,
    Verbose = 3,
    Debug = 4
}
