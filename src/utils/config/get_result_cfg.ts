import { defaultCfg } from '../../shared/default_cfg.js';
import { IResultConfig, IUserConfig } from '../../types/cfg.type.js';

export function getResultCfg(fileCfg: IUserConfig, cliCfg: IUserConfig = {} as IUserConfig): IResultConfig {
    const mixedCfg = {
        ...defaultCfg,
        ...fileCfg,
        ...cliCfg,
    };

    mixedCfg.breakPoints ??= [];
    mixedCfg.breakPoints.forEach(b => {
        b.height ??= defaultCfg.defaultViewport.height;
        b.width ??= defaultCfg.defaultViewport.width;
    });

    return mixedCfg as IResultConfig;
}
