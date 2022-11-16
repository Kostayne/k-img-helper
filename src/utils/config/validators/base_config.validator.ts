import { IBreakPoint } from '../../../types/breakpoint.type.js';
import { IUserConfig } from '../../../types/cfg.type.js';

export class BaseConfigValidator {
    validate(cfg: IUserConfig) {
        if (!cfg.url) {
            return 'Site url is not provided!';
        }

        const breakPoints = cfg.breakPoints || [];
        let err = '';

        for (let i = 0; i < breakPoints.length; i++) {
            err = this.validateBreakPoint(breakPoints[i]);
            if (err) return err;
        }

        err = this.validateBreakPoint(cfg.defaultBreakPoint);
    }
}
