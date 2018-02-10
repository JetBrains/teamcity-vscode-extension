import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {SummaryDao} from "../../dal/summarydao";
import {Output} from "../../view/output";
import {MessageConstants} from "../utils/messageconstants";
import {Change} from "../entities/change";
import {Logger} from "../utils/logger";

@injectable()
export class ShowMyChanges implements Command {

    private summaryDao: SummaryDao;
    private output: Output;

    public constructor(@inject(TYPES.SummaryDao) summaryDao: SummaryDao,
                       @inject(TYPES.Output) output: Output) {
        this.summaryDao = summaryDao;
        this.output = output;
    }

    public async exec(): Promise<void> {
        Logger.logDebug("ShowMyChanges::exec start");
        const stringBuilder = [];
        stringBuilder.push("My Changes:\n");
        const summary = await this.summaryDao.get();
        const changeSet = [summary.changes, summary.personalChanges];
        if ((!summary.changes || summary.changes.length === 0) &&
            (!summary.personalChanges || summary.personalChanges.length === 0)) {
            Logger.logDebug(`ShowMyChanges::exec: personal changes were not found`);
            stringBuilder.push(MessageConstants.NOTHING_TO_SHOW);
            stringBuilder.push("----------------------");
            return;
        }

        const todayChanges = [];
        const yesterdayChanges = [];
        const olderChanges = [];
        changeSet.forEach((changes) => {
            changes.forEach((change) => {
                const changeDate = change.vcsDate;
                if (this.isToday(changeDate)) {
                    todayChanges.push(change);
                } else if (this.isYesterday(changeDate)) {
                    yesterdayChanges.push(change);
                } else {
                    olderChanges.push(change);
                }
            });
        });

        stringBuilder.push("----------------------");
        stringBuilder.push("Today:");
        stringBuilder.push("----------------------");
        stringBuilder.push(this.formTextFromChanges(todayChanges));
        stringBuilder.push("Yesterday:");
        stringBuilder.push("----------------------");
        stringBuilder.push(this.formTextFromChanges(yesterdayChanges));
        stringBuilder.push("Older:");
        stringBuilder.push("----------------------");
        stringBuilder.push(this.formTextFromChanges(olderChanges));

        this.output.appendLine(stringBuilder.join("\n"));
        this.output.show();
        Logger.logDebug("ShowMyChanges::exec finished " + stringBuilder.join("\n"));
    }

    private formTextFromChanges(changes: Change[]) {
        const stringBuilder = [];
        if (changes && changes.length !== 0) {
            Logger.logDebug(`ShowMyChanges::exec: found ${changes.length} personal changes`);
            changes.forEach((change) => {
                const appendLine = ShowMyChanges.formAppendLine(change);
                stringBuilder.push(appendLine);
                stringBuilder.push("----------------------");
            });
        } else {
            Logger.logDebug(`ShowMyChanges::exec: personal changes were not found`);
            stringBuilder.push("----------------------");
        }
        return stringBuilder.join("\n");
    }

    private static formAppendLine(change: Change) {
        const description = change.myDescription ? change.myDescription : "<no comment>";
        const myVersionControlName = change.myVersionControlName;
        const changesCount = `${change.myChangesCount} file${change.myChangesCount === 0 ? "s" : ""}`;
        return `${description}\n${myVersionControlName} | ${changesCount}`;
    }

    private isToday(date: Date): boolean {
        const today = new Date();
        return ShowMyChanges.isSameDay(date, today);
    }

    private isYesterday(date: Date): boolean {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        return ShowMyChanges.isSameDay(date, yesterday);
    }

    private static isSameDay(d1, d2) : boolean {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }
}
