import { Inject, Service } from 'typedi';
import { IResultConfig } from '../../types/cfg.type.js';
import { IDomImgInfo } from '../../types/dom_img_info.type.js';
import { OptionalCliLogger } from '../../utils/loggers/optional_logger.js';

@Service()
export class AnalyzeCmdLogger {
    public lackSrcImgs: IDomImgInfo[] = [];
    public lackFixedSizeImgs: IDomImgInfo[] = [];
    public lackAltImgs: IDomImgInfo[] = [];

    constructor(
        @Inject('cfg')
        protected cfg: IResultConfig,
        protected optionalLogger: OptionalCliLogger,
    ) {}

    public logInfo() {
        if (!this.cfg.log) {
            return;
        }

        this.logLackSrcs();
        this.logLackFixedSizes();
        this.logLackAltAttrs();
    }

    protected logLackSrcs() {
        if (!this.cfg.detectNoSrcAttr) {
            return;
        }

        this._logListLackOf(this.lackSrcImgs, 'src attribute');
    }

    protected logLackFixedSizes() {
        if (!this.cfg.detectNoSizeAttr) {
            return;
        }

        this._logListLackOf(this.lackFixedSizeImgs, 'fixed size');
    }

    protected logLackAltAttrs() {
        if (!this.cfg.detectNoAltAttr) {
            return;
        }

        this._logListLackOf(this.lackAltImgs, 'alt attribute');
    }

    protected _logListLackOf(imgs: IDomImgInfo[], lackObj: string) {
        imgs.forEach((img, i) => {
            this.optionalLogger.logMsg(`Img with src ${img.src}, selector ${img.selector} has no ${lackObj}`);

            if (i < imgs.length - 1) {
                this.optionalLogger.logSpace();
            }
        });

        this.optionalLogger.logSpaceAfterArr(imgs);
    }
}
