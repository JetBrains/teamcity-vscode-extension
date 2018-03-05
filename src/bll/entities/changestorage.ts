import {Change} from "./change";
import {Summary} from "./summary";

export class ChangeStorage {
    private readonly changes: String[] = [];
    private readonly personalChanges: String[] = [];

    public contains(change: Change) {
        return this.getCorrespondingArray(change).indexOf(change.toString()) !== -1;
    }

    public storeNewChanges(newChanges: Change[]): void {
        if (newChanges) {
            newChanges.forEach((change) => {
                this.getCorrespondingArray(change).push(change.toString());
            });
        }
    }

    private getCorrespondingArray(change: Change): String[] {
        return change.isPersonal ? this.personalChanges : this.changes;
    }

    public reset() {
        this.changes.length = 0;
        this.personalChanges.length = 0;
    }

    public extractNewChangesFromSummary(summary: Summary): Change[] {
        const newChanges: Change[] = [];
        const changeSet = [summary.changes, summary.personalChanges];

        changeSet.forEach((changes) => {
            changes.forEach((change) => {
                if (!this.contains(change)) {
                    newChanges.push(change);
                }
            });
        });

        return newChanges;
    }
}
