import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {SummaryDao} from "../../dal/summarydao";
import {Change} from "../entities/change";
import {Logger} from "../utils/logger";
import {IChangesProvider} from "../../view/dataproviders/interfaces/ichangesprovider";
import {TimePeriod} from "../entities/timeperiod";

@injectable()
export class ShowMyChanges implements Command {

    private summaryDao: SummaryDao;
    private changesProvider: IChangesProvider;

    public constructor(@inject(TYPES.SummaryDao) summaryDao: SummaryDao,
                       @inject(TYPES.ChangesProvider) changesProvider) {
        this.summaryDao = summaryDao;
        this.changesProvider = changesProvider;
    }

    public async exec(): Promise<void> {
        Logger.logDebug("ShowMyChanges::exec start");
        const summary = await this.summaryDao.get();
        const changeSet = [summary.changes, summary.personalChanges];
        if ((!summary.changes || summary.changes.length === 0) &&
            (!summary.personalChanges || summary.personalChanges.length === 0)) {
            Logger.logDebug(`ShowMyChanges::exec: personal changes were not found`);
            return;
        }

        const todayChanges: Change[] = [];
        const yesterdayChanges: Change[] = [];
        const olderChanges: Change[] = [];
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

        const timePeriods = [new TimePeriod("Today", todayChanges), new TimePeriod("Yesterday", yesterdayChanges), new TimePeriod("Older", olderChanges)];
        this.changesProvider.setContent(timePeriods);

        Logger.logDebug("ShowMyChanges::exec finished ");
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
