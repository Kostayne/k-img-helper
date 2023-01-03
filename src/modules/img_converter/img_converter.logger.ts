import { Inject, Service } from 'typedi';
// import own
import { IResultConfig } from '../../types/cfg.type.js';
import { OptionalCliLogger } from '../../utils/loggers/optional_logger.js';
import { IConvertedImgInfo } from './types/convertation_to_log.type.js';

@Service()
export class ImgConverterLogger {
    constructor(
        @Inject('cfg') protected cfg: IResultConfig,
        protected optionalLogger: OptionalCliLogger,
    ) {}

    public deletedImgPaths: string[] = [];
    public skippedImgPaths: string[] = [];
    public convertedImgsToLog: IConvertedImgInfo[] = [];

    public logInfo() {
        // log skipped
        if (this.cfg.logSkipped) {
            this.logSkippedImgs();
        }

        // log converted
        if (this.cfg.logImgConvert) {
            this.logConvertedImgs();
        }

        // log deleted
        if (this.cfg.logDeleteConverted) {
            this.logDeletedImgs();
        }
    }

    protected logConvertedImgs() {
        this.convertedImgsToLog.forEach(c => {
            this.logImgConvert(c.imgOriginalPath, c.format);
        });

        if (this.convertedImgsToLog.length > 0) {
            this.optionalLogger.logSpace();
        }
    }

    protected logSkippedImgs() {
        for (const p of this.skippedImgPaths) {
            this.optionalLogger.logWarning(`Skipping ${p}...`);
        }
    }

    protected logDeletedImgs() {
        this.deletedImgPaths.forEach(p => {
            this.optionalLogger.logMsg(`Deleted ${p} after convertation`);
        });
    }

    protected logImgConvert(filePath: string, resFormat: string) {
        this.optionalLogger.logMsg(`Converted "${filePath}" to .${resFormat};`);
    }
}
