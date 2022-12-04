import { IUserConfig } from '../../../types/cfg.type.js';
import { Validator } from 'jsonschema';
import { breakPointValidationSchema } from '../../../validator/breakpoint.val.schema.js';
import { userConfigValidationSchema } from '../../../validator/user_config.val.schema.js';

export class BaseConfigValidator {
    validate(cfg: IUserConfig) {
        const v = new Validator();

        v.addSchema(breakPointValidationSchema);
        const res = v.validate(cfg, userConfigValidationSchema);
        
        if (res.errors) {
            return res.errors.toString();
        }

        const allowedFormats = [undefined, 'avif', 'webp'];

        allowedFormats.forEach(f => {
            if (f !== cfg.imgFormat) {
                return 'Img format must be "avif" or "webp"';
            }
        });

        return '';
    }
}
