import { IResultConfig } from '../types/result_cfg.type.js';
import { BaseConfigValidator } from '../utils/config/validators/base_config.validator.js';
import { SmartLogger } from '../utils/smart_logger.js';

export class Cmd {
    protected cfgValidator: BaseConfigValidator = new BaseConfigValidator();
    protected logger: SmartLogger;

    constructor(
        protected cfg: IResultConfig,
    ) {
        const validationErrMsg = this.cfgValidator.validate(cfg);

        this.logger = new SmartLogger(cfg);

        if (validationErrMsg) {
            this.logger.logError(validationErrMsg);
            process.exit(1);
        }
    }
}
