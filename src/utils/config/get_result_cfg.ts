import { defaultCfg } from '../../shared/default_cfg.js';
import { IUserConfig } from '../../types/cfg.type.js';
import { IResultConfig } from '../../types/result_cfg.type.js';

export function getResultCfg(fileCfg: IUserConfig, cliCfg: IUserConfig): IResultConfig {
    const mixedCfg = {
        ...defaultCfg,
        ...fileCfg,
        ...cliCfg,
    };

    mixedCfg.breakPoints ??= [];
    mixedCfg.breakPoints.forEach(b => {
        b.height ??= defaultCfg.defaultBreakPoint.height;
        b.width ??= defaultCfg.defaultBreakPoint.width;
    });

    return mixedCfg as IResultConfig;
}
