interface Command {
    exec(): Promise<void>;
}
