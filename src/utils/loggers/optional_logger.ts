import { Inject, Service } from 'typedi';
import { IResultConfig } from '../../types/cfg.type.js';
import { CliLogger } from './cli_logger.js';

@Service()
export class OptionalCliLogger {
    // eslint-disable-next-line no-unused-vars
    constructor(
        @Inject('cfg')
        protected cfg: IResultConfig
    ) {}

    public logSpaceAfterArr<T>(arr: Array<T>) {
        if (arr.length > 0) {
            this.logSpace();
        }
    }

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
