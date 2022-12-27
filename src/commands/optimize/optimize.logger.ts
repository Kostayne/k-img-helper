import { Inject, Service } from 'typedi';
import { ImgConverterLogger } from '../../modules/img_converter/img_converter.logger.js';
import { ImgResizerLogger } from '../../modules/img_resizer/img_resizer.logger.js';
import { IResultConfig } from '../../types/cfg.type.js';
import { OptionalCliLogger } from '../../utils/loggers/optional_logger.js';
import { IResizesToLogInfo } from './types/resizes_to_log.type.js';
import { ISrcSetLogInfo } from './types/scrset_log_info.type.js';

@Service()
export class OptimizeCmdLogger extends OptionalCliLogger {
    public srcSetsToLog: ISrcSetLogInfo[] = [];
    public resizesToLog: IResizesToLogInfo[] = [];
    public deletedConvertedImgPaths: string[] = [];

    constructor(
        @Inject('cfg')
        protected cfg: IResultConfig,
        protected imgConverterLogger: ImgConverterLogger,
        protected imgResizerLogger: ImgResizerLogger,
    ) {
        super(cfg);
    }

    public logInfo() {
        // converted imgs log 
        if (this.cfg.logImgConvert) {
            this.imgConverterLogger.logConvertedImgs();
        }
        
        // resizes log
        if (this.cfg.logResizes) {
            this.imgResizerLogger.logAllImgResizes();
        }

        // srcset log
        this.srcSetsToLog.forEach(s => {
            this.logSrcSet(s.srcset, s.selector);
            this.logSpace();
        }); 

        if (this.cfg.logDeleteConverted) {
            for (const imgPath of this.deletedConvertedImgPaths) {
                this.logDeleteAfterConvertation(imgPath);
            }
        }
    }

    protected logSrcSet(srcSet: string, selector: string) {
        if (this.logSrcSet) {
            this.logMsg(`Generated srcset for selector "${selector}"`);
            this.logMsg(srcSet);
        }
    }

    protected logImgConvert(filePath: string, resFormat: string) {
        if (this.cfg.logImgConvert) {
            this.logMsg(`Converted "${filePath}" to .${resFormat};`);
        }
    }

    protected logDeleteAfterConvertation(filePath: string) {
        this.logMsg(`Deleted ${filePath} after convertation`);
    }

    public logImgSkip(imgPath: string) {
        if (this.cfg.logSkipped) {
            this.logWarning(`Can't process file: ${imgPath}; Skipping...`);
        }
    }

    public logSpace() {
        this.logMsg('');
    }
}
