import {RemoteBuildServer} from "../../dal/remotebuildserver";
import {ModificationSubscription} from "../notifications/modificationsubscription";

export class EventCounter {
    private counter: number;

    private constructor() {}

    public static async getInstance(remoteBuildServer: RemoteBuildServer,
                                    subscription: ModificationSubscription): Promise<EventCounter> {
        const instance = new EventCounter();
        const serializedSubscription: string = subscription.serialize();
        instance.counter = await remoteBuildServer.getTotalNumberOfEvents(serializedSubscription);
        return instance;
    }

    public update(newCounter: EventCounter) {
        this.counter = newCounter.counter;
    }

    public notEquals(newCounter: EventCounter): boolean {
        return !newCounter || this.counter !== newCounter.counter;
    }
}
