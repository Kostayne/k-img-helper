import { IResultConfig } from '../types/cfg.type.js';
import { BaseConfigValidator } from '../utils/config/validators/base_config.validator.js';
import { CliLogger } from '../utils/loggers/cli_logger.js';

export class CmdBackend {
    protected cfgValidator: BaseConfigValidator = new BaseConfigValidator();

    constructor(
        protected cfg: IResultConfig,
    ) {
        const validationErrMsg = this.cfgValidator.validate(cfg);

        if (validationErrMsg) {
            CliLogger.logError(validationErrMsg);
            process.exit(1);
        }
    }
}
