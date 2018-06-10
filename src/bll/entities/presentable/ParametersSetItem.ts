import {ExpandableItem} from "./expandableitem";
import {TreeItemCollapsibleState} from "vscode";
import {Parameter} from "../Parameter";
import {ParameterItem} from "./ParameterItem";

export class ParametersSetItem extends ExpandableItem {
    public readonly children: ParameterItem[] = [];

    constructor(label: string, private readonly params: Parameter[]) {
        super(label, TreeItemCollapsibleState.Expanded);

        params.forEach((param) => {
            this.children.push(new ParameterItem(param));
        });
    }
}
