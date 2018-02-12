import {Change} from "../../../bll/entities/change";

export interface IChangesProvider {
    resetTreeContent(): void;

    setContent(changes: Change[]): void;
}
