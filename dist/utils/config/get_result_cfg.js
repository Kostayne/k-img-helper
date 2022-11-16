import { defaultCfg } from "../../shared/default_cfg.js";
export function getResultCfg(fileCfg, cliCfg) {
    return {
        ...defaultCfg,
        ...fileCfg,
        ...cliCfg,
    };
}
//# sourceMappingURL=get_result_cfg.js.map