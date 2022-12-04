import { IUserConfig } from '../../types/cfg.type.js';
import { Logger } from '../../utils/logger.js';
import { IResizesToLogInfo } from './types/resizes_to_log.type.js';

export class OptimizeImgLogger {
    // eslint-disable-next-line no-unused-vars
    constructor(protected cfg: IUserConfig) {}

    public logSrcSet(srcSet: string, selector: string) {
        if (this.logSrcSet) {
            this.logInfo(`Generated srcset for selector "${selector}"`);
            this.logInfo(srcSet);
        }
    }

    public logResizesArr({ imgPath, resizes, selector }: IResizesToLogInfo) {
        if (!this.cfg.logResizes) { 
            return;
        }

        this.logInfo(`Created resizes for "${imgPath}" with selector "${selector}":`);

        this.logInfo(
            JSON.stringify(resizes, null, '\t')
        );
    }

    public logImgConvert(filePath: string, resFormat: string) {
        if (this.cfg.logImgConvert) {
            this.logInfo(`Converted "${filePath}" to .${resFormat};`);
        }
    }

    public logImgSkip(imgPath: string) {
        if (this.cfg.logSkipped) {
            this.logWarning(`Can't process file: ${imgPath}; Skipping...`);
        }
    }

    public logSpace() {
        this.logInfo('');
    }

    public logInfo(msg: string) {
        if (this.cfg.log) {
            console.log(msg);
        }
    }

    public logWarning(msg: string) {
        if (this.cfg.log) {
            Logger.logWarning(msg);
        }
    }

    logError(msg: string) {
        Logger.logError(msg);
    }
}
