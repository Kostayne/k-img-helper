import { IResultConfig } from '../../types/cfg.type.js';
import { CliLogger } from './cli_logger.js';

export class OptionalCliLogger {
    // eslint-disable-next-line no-unused-vars
    constructor(protected cfg: IResultConfig) {}

    public logSpace() {
        this.logMsg('');
    }
    
    public logMsg(msg: string) {
        if (this.cfg.log) {
            console.log(msg);
        }
    }

    public logWarning(msg: string) {
        if (this.cfg.log) {
            CliLogger.logWarning(msg);
        }
    }
}
