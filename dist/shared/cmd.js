import { BaseConfigValidator } from "../utils/config/validators/base_config.validator.js";
import { logError } from "../utils/log/log_error.js";
export class Cmd {
    cfg;
    cfgValidator = new BaseConfigValidator();
    constructor(cfg) {
        this.cfg = cfg;
        const validationErrMsg = this.cfgValidator.validate(cfg);
        if (validationErrMsg) {
            logError(validationErrMsg);
            process.exit(1);
        }
    }
}
//# sourceMappingURL=cmd.js.map