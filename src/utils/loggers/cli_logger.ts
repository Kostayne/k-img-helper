import chalk from 'chalk';

export class CliLogger {
    static logError(err: string) {
        console.error(
            chalk.redBright(err)
        );
    }

    static logWarning(msg: string) {
        console.error(
            chalk.yellowBright(msg)
        );
    }
}
