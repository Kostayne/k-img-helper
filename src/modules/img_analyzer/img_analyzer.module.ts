import { Inject, Service } from 'typedi';
// import own
import { IResultConfig } from '../../types/cfg.type.js';
import { IDomImgInfo } from '../../types/dom_img_info.type.js';
import { IImagePathInfo } from '../../types/img_path_info.type.js';
import { checkNameWithTypeMismatch } from '../../utils/check_name_with_type_mismatch.js';
import { ImgAnalyzerLogger } from './img_analyzer.logger.js';

@Service()
export class ImgAnalyzer {
    constructor(
        @Inject('cfg') protected cfg: IResultConfig,
        protected logger: ImgAnalyzerLogger,
    ) {}

    public analyzeImg(imgInfo: IDomImgInfo, imgPathInfo: IImagePathInfo, ext: string) {
        if (!imgInfo.alt) {
            this.logger.lackAltImgs.push(imgInfo);
        }

        if (!imgInfo.src) {
            this.logger.lackSrcImgs.push(imgInfo);
        }

        if (this.cfg.detectTypeMismatch) {
            checkNameWithTypeMismatch(imgPathInfo.fullPath, ext);
        }

        // TODO add size check

        this.logger.logInfo();
    }

    public logAnalyzedInfo() {
        this.logger.logInfo();
    }
}
