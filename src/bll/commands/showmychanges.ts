import {inject, injectable} from "inversify";
import {TimePeriodEnum, TYPES} from "../utils/constants";
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

        const sortedChanges = ShowMyChanges.getSortedChanges(changeSet);
        const timePeriods = [new TimePeriod(TimePeriodEnum.Today, sortedChanges[TimePeriodEnum.Today]),
            new TimePeriod(TimePeriodEnum.Yesterday, sortedChanges[TimePeriodEnum.Yesterday]),
            new TimePeriod(TimePeriodEnum.Older, sortedChanges[TimePeriodEnum.Older])];
        this.changesProvider.setContent(timePeriods);
        Logger.logDebug("ShowMyChanges::exec finished ");
    }

    private static getSortedChanges(changeSet) {
        const sortedChanges = [];
        changeSet.forEach((changes) => {
            changes.forEach((change) => {
                const changeTimePeriod = ShowMyChanges.getTimePeriod(change);
                if (!sortedChanges[changeTimePeriod]) {
                    sortedChanges[changeTimePeriod] = [];
                }
                sortedChanges[changeTimePeriod].push(change);
            });
        });
        return sortedChanges;
    }

    private static getTimePeriod(change: Change): TimePeriodEnum {
        const changeDate = change.vcsDate;
        if (ShowMyChanges.isToday(changeDate)) {
            return TimePeriodEnum.Today;
        } else if (ShowMyChanges.isYesterday(changeDate)) {
            return TimePeriodEnum.Yesterday;
        } else {
            return TimePeriodEnum.Older;
        }
    }

    private static isToday(date: Date): boolean {
        const today = new Date();
        return ShowMyChanges.isSameDay(date, today);
    }

    private static isYesterday(date: Date): boolean {
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
