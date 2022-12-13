import { ImgConverterLogger } from '../../modules/img_converter/img_converter.logger.js';
import { IResultConfig } from '../../types/cfg.type.js';
import { OptionalCliLogger } from '../../utils/loggers/optional_logger.js';
import { IConvertedImgInfo } from './types/convertation_to_log.type.js';
import { IResizesToLogInfo } from './types/resizes_to_log.type.js';
import { ISrcSetLogInfo } from './types/scrset_log_info.type.js';
import { ITypeMismatchToLog } from './types/type_mismatch_to_log.type.js';

export class OptimizeCmdLogger extends OptionalCliLogger {
    public srcSetsToLog: ISrcSetLogInfo[] = [];
    public typeMismatchesToLog: ITypeMismatchToLog[] = [];
    public convertedImgsToLog: IConvertedImgInfo[] = [];
    public resizesToLog: IResizesToLogInfo[] = [];

    constructor(
        // eslint-disable-next-line no-unused-vars
        protected imgConverterLogger: ImgConverterLogger,
        protected cfg: IResultConfig,
    ) {
        super(cfg);
    }

    public logInfo() {
        // converted imgs log 
        this.convertedImgsToLog.forEach(c => {
            this.logImgConvert(c.imgOriginalPath, c.format);
        });

        if (this.imgConverterLogger.convertedImgsToLog.length > 0) {
            this.logSpace();
        }
        
        // resizes log
        this.resizesToLog.forEach(resizeInfo => {
            this.logResizesArr(resizeInfo);
            this.logSpace();
        });

        if (this.resizesToLog.length > 0) {
            this.logSpace();
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

    protected logResizesArr({ imgPath, resizes, selector }: IResizesToLogInfo) {
        if (!this.cfg.logResizes) { 
            return;
        }

        this.logMsg(`Created resizes for "${imgPath}" with selector "${selector}":`);

        this.logMsg(
            JSON.stringify(resizes, null, '\t')
        );
    }

    protected logImgConvert(filePath: string, resFormat: string) {
        if (this.cfg.logImgConvert) {
            this.logMsg(`Converted "${filePath}" to .${resFormat};`);
        }
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
