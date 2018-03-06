interface Command {
    exec(args: any[]): Promise<void>;
}
