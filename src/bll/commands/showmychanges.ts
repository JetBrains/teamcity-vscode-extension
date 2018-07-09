import {inject, injectable} from "inversify";
import {TimePeriodEnum, TYPES} from "../utils/constants";
import {SummaryDao} from "../../dal/summarydao";
import {Change} from "../entities/change";
import {Logger} from "../utils/logger";
import {IChangesProvider} from "../../view/dataproviders/interfaces/ichangesprovider";
import {TimePeriod} from "../entities/timeperiod";
import {WindowProxy} from "../moduleproxies/window-proxy";
import {Summary} from "../entities/summary";

@injectable()
export class ShowMyChanges implements Command {

    public constructor(@inject(TYPES.SummaryDao) private readonly summaryDao: SummaryDao,
                       @inject(TYPES.ChangesProvider) private readonly changesProvider: IChangesProvider,
                       @inject(TYPES.WindowProxy) private readonly windowsProxy: WindowProxy) {
        //
    }

    public async exec(): Promise<void> {
        Logger.logDebug("ShowMyChanges::exec start");
        const summaryPromise: Promise<Summary> = this.summaryDao.get();
        this.windowsProxy.showWithProgress("Receiving data from the server...", summaryPromise);
        const summary: Summary = await summaryPromise;

        if ((!summary.changes || summary.changes.length === 0) &&
            (!summary.personalChanges || summary.personalChanges.length === 0)) {
            Logger.logDebug(`ShowMyChanges::exec: personal changes were not found`);
            return;
        }

        const sortedChanges: Change[] = ShowMyChanges.getSortedChanges(summary);

        const classifiedChanges: Map<TimePeriodEnum, Change[]> = ShowMyChanges.classifyChanges(sortedChanges);
        const timePeriods = [new TimePeriod(TimePeriodEnum.Today, classifiedChanges.get(TimePeriodEnum.Today)),
            new TimePeriod(TimePeriodEnum.Yesterday, classifiedChanges.get(TimePeriodEnum.Yesterday)),
            new TimePeriod(TimePeriodEnum.Older, classifiedChanges.get(TimePeriodEnum.Older))];
        this.changesProvider.setContent(timePeriods);
        Logger.logDebug("ShowMyChanges::exec finished ");
    }

    private static getSortedChanges(summary: Summary): Change[] {
        const sortedChanges: Change[] = summary.changes.concat(summary.personalChanges);

        sortedChanges.sort((ch1, ch2) => {
            return (ch1.vcsDate < ch2.vcsDate) ? 1 : ((ch1.vcsDate > ch2.vcsDate) ? -1 : 0);
        });
        return sortedChanges;
    }

    private static classifyChanges(changes: Change[]): Map<TimePeriodEnum, Change[]> {
        const classifiedChanges: Map<TimePeriodEnum, Change[]> = new Map<TimePeriodEnum, Change[]>();

        changes.forEach((change) => {
            const changeTimePeriod = ShowMyChanges.getTimePeriod(change);
            let changeSet: Change[] = classifiedChanges.get(changeTimePeriod);
            if (!changeSet) {
                changeSet = [];
                classifiedChanges.set(changeTimePeriod, changeSet);
            }
            changeSet.push(change);
        });

        return classifiedChanges;
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

    private static isSameDay(d1, d2): boolean {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }
}
