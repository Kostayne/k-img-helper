import { OptimizeImgLogger } from '../commands/optimize/optimize_cmd.logger.js';
import { IResultConfig } from '../types/cfg.type.js';
import { BaseConfigValidator } from '../utils/config/validators/base_config.validator.js';

export class Cmd {
    protected cfgValidator: BaseConfigValidator = new BaseConfigValidator();
    protected logger: OptimizeImgLogger;

    constructor(
        protected cfg: IResultConfig,
    ) {
        const validationErrMsg = this.cfgValidator.validate(cfg);

        this.logger = new OptimizeImgLogger(cfg);

        if (validationErrMsg) {
            this.logger.logError(validationErrMsg);
            process.exit(1);
        }
    }
}
