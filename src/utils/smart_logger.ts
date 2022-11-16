import { IUserConfig } from '../types/cfg.type.js';
import { Logger } from './logger.js';

export class SmartLogger {
    // eslint-disable-next-line no-unused-vars
    constructor(protected cfg: IUserConfig) {}

    logInfo(msg: string) {
        if (this.cfg.log) {
            console.log(msg);
        }
    }

    logImgConvert(filePath: string, resFormat: string) {
        if (this.cfg.logImgConvert) {
            this.logInfo(`Converting ${filePath} to ${resFormat}`);
        }
    }

    logImgSkip(imgPath: string) {
        if (this.cfg.logSkipped) {
            this.logWarning(`Can't process file: ${imgPath}; Skipping...`);
        }
    }

    logWarning(msg: string) {
        if (this.cfg.log) {
            Logger.logWarning(msg);
        }
    }

    logError(msg: string) {
        Logger.logError(msg);
    }
}
