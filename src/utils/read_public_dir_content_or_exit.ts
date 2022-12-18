import { IResultConfig } from '../types/cfg.type.js';
import { scanPublicDirContent } from './scan_pulbic_dir.js';

export async function readPublicDirContentOrExit(cfg: IResultConfig) {
    const publicDirContent = await scanPublicDirContent(cfg);

    if (publicDirContent === null) {
        process.exit(1);
    }

    return publicDirContent;
}
