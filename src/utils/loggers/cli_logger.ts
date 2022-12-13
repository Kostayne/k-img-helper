import chalk from 'chalk';

export class CliLogger {
    static logMsg(msg: string) {
        console.log(msg);
    }

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
