import { IBreakPoint } from '../../../types/breakpoint.type.js';
import { IResultConfig } from '../../../types/result_cfg.type.js';
import { BaseConfigValidator } from './base_config.validator.js';

export class OptimizeConfigValidator extends BaseConfigValidator {
    validate(cfg: IResultConfig): string {
        const err = super.validate(cfg);
        if (err) return err;

        if (!cfg.publicDir) {
            return 'publicDir is not set!';
        }

        const breakPoints = (cfg.breakPoints || []) as Required<Required<IBreakPoint>>[];

        for (const [i, b] of breakPoints) {
            for (const attr of [b.height, b.width]) {
                if (typeof attr !== 'number') {
                    return `Breakpoints must contain number in height & width! Check breakPoint with index ${i} in your config!`;
                }
            }
        }
    }
}
