"use strict";

import {ChangeItemProxy} from "./changeitemproxy";

export class ChangeStorage {
    private readonly changes: String[] = [];
    private readonly personalChanges: String[] = [];

    public contains(change: ChangeItemProxy) {
        return this.getCorrespondingArray(change).indexOf(change.toString()) !== -1;
    }

    public storeNewChanges(newChanges: ChangeItemProxy[]): void {
        if (newChanges) {
            newChanges.forEach((change) => {
                this.getCorrespondingArray(change).push(change.toString());
            });
        }
    }

    private getCorrespondingArray(change: ChangeItemProxy): String[] {
        return change.isPersonal ? this.personalChanges : this.changes;
    }

    public reset() {
        this.changes.length = 0;
        this.personalChanges.length = 0;
    }
}
