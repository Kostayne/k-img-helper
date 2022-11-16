import { BaseConfigValidator } from "./base_config.validator.js";
export class OptimizeConfigValidator extends BaseConfigValidator {
    validate(cfg) {
        let err = super.validate(cfg);
        if (err)
            return err;
        if (!cfg.publicDir) {
            return 'publicDir is not set!';
        }
    }
}
//# sourceMappingURL=optimize_config.validator.js.map