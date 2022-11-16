export class BaseConfigValidator {
    validate(cfg) {
        if (!cfg.url) {
            return 'Site url is not provided!';
        }
    }
}
//# sourceMappingURL=base_config.validator.js.map