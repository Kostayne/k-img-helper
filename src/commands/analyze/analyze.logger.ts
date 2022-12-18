import { Inject, Service } from 'typedi';
import { IResultConfig } from '../../types/cfg.type.js';
import { OptionalCliLogger } from '../../utils/loggers/optional_logger.js';

@Service()
export class AnalyzeCmdLogger {
    public lackSrcImgSelectors: string[] = [];
    public lackFixedSizeImgSelectors: string[] = [];
    public lackAltImgSelectors: string[] = [];

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
        if (!this.cfg.detectSrcAttr) {
            return;
        }

        this._logListLackOf(this.lackSrcImgSelectors, 'src attribute');
    }

    protected logLackFixedSizes() {
        if (!this.cfg.detectSizeAttr) {
            return;
        }

        this._logListLackOf(this.lackFixedSizeImgSelectors, 'fixed size');
    }

    protected logLackAltAttrs() {
        if (!this.cfg.detectAltAttr) {
            return;
        }

        this._logListLackOf(this.lackAltImgSelectors, 'alt attribute');
    }

    protected _logListLackOf(imgSelectors: Array<string>, lackObj: string) {
        imgSelectors.forEach(s => {
            this.optionalLogger.logMsg(`Img with selector ${s} has no ${lackObj}`);
        });

        this.optionalLogger.logSpaceAfterArr(imgSelectors);
    }
}
