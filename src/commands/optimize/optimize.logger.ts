import { Inject, Service } from 'typedi';
// import own
import { ImgConverterLogger } from '../../modules/img_converter/img_converter.logger.js';
import { ImgResizerLogger } from '../../modules/img_resizer/img_resizer.logger.js';
import { IResultConfig } from '../../types/cfg.type.js';
import { OptionalCliLogger } from '../../utils/loggers/optional_logger.js';
import { ISrcSetLogInfo } from './types/scrset_log_info.type.js';

@Service()
export class OptimizeCmdLogger extends OptionalCliLogger {
    public srcSetsToLog: ISrcSetLogInfo[] = [];

    constructor(
        @Inject('cfg')
        protected cfg: IResultConfig,
        protected imgConverterLogger: ImgConverterLogger,
        protected imgResizerLogger: ImgResizerLogger,
    ) {
        super(cfg);
    }

    public addDeletedImgPathToLog(imgPath: string) {
        this.imgConverterLogger.deletedImgPaths.push(imgPath);
    }

    public addSkippedImgPathToLog(imgPath: string) {
        this.imgConverterLogger.skippedImgPaths.push(imgPath);
    }

    public logInfo() {
        // converted imgs log 
        this.imgConverterLogger.logInfo();
        
        // resizes log
        if (this.cfg.logResizes) {
            this.imgResizerLogger.logAllImgResizes();
        }

        // srcset log
        this.srcSetsToLog.forEach(s => {
            this.logSrcSet(s.srcset, s.selector);
            this.logSpace();
        }); 
    }

    protected logSrcSet(srcSet: string, selector: string) {
        if (this.logSrcSet) {
            this.logMsg(`Generated srcset for selector "${selector}"`);
            this.logMsg(srcSet);
        }
    }
}
