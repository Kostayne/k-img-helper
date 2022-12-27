import { readFile } from 'fs/promises';
import { CliLogger } from './loggers/cli_logger.js';

export async function readImageBuffer(imgFullPath: string) {
    try {
        return readFile(imgFullPath);
    } catch(e) {
        CliLogger.logError(e);
        return undefined;
    }
}
