import { join } from 'path';
// ---
import { IResultConfig } from '../types/cfg.type.js';

export function getImageFullPath(cfg: IResultConfig, relPath: string) {
    return join(cfg.publicDir, relPath);
}
