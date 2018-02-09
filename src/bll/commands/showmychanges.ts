"use strict";

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
        const summary = await this.summaryDao.get();
        const personalChanges = summary.personalChanges;
        const stringBuilder = [];
        stringBuilder.push("My Changes:\n");
        if (personalChanges && personalChanges.length !== 0) {
            Logger.logDebug(`ShowMyChanges::exec: found ${personalChanges.length} personal changes`);
            personalChanges.forEach((change) => {
                const appendLine = this.formAppendLine(change);
                stringBuilder.push(appendLine);
                stringBuilder.push("----------------------");
            });
        } else {
            Logger.logDebug(`ShowMyChanges::exec: personal changes were not found`);
            stringBuilder.push(MessageConstants.NOTHING_TO_SHOW);
            stringBuilder.push("----------------------");
        }
        this.output.appendLine(stringBuilder.join("\n"));
        this.output.show();
        Logger.logDebug("ShowMyChanges::exec finished " + stringBuilder.join("\n"));
    }

    private formAppendLine(change: Change) {
        const description = change.myDescription ? change.myDescription : "<no comment>";
        const myVersionControlName = change.myVersionControlName;
        const changesCount = `${change.myChangesCount} file${change.myChangesCount === 0 ? "s" : ""}`;
        return `${description}\n${myVersionControlName} | ${changesCount}`;
    }
}
