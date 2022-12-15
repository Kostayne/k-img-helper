import { readdir } from 'fs/promises';
import { IResultConfig } from '../types/cfg.type.js';
import { CliLogger } from './loggers/cli_logger.js';

/**
 * @description returns dir content string[] or null, if error occured
 */
export async function scanPublicDirContent(cfg: IResultConfig): Promise<string[] | null> {
    if (!cfg) {
        CliLogger.logError(`Invalid config passed to scanPublicDir fn, it's ${cfg}`);
        return null;
    }

    if (!cfg.publicDir) {
        CliLogger.logError('Property publicDir in config is not set');
        return null;
    }

    try {
        return readdir(cfg.publicDir);
    } catch(e) {
        CliLogger.logError(`Can't open specified public folder, does it exist? You specified this path: ${cfg.publicDir}`);
        return null;
    }
}
