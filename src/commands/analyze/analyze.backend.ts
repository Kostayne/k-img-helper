import { Inject, Service } from 'typedi';
import { ImgTagInfoCollector } from '../../modules/img_tag_info_collector/img_tag_info_collector.module.js';
import { IResultConfig } from '../../types/cfg.type.js';
import { IDomImgInfo } from '../../types/dom_img_info.type.js';
import { AnalyzeCmdLogger } from './analyze.logger.js';

@Service()
export class AnalyzeCmdBackend {
    constructor(
        @Inject('cfg')
        protected cfg: IResultConfig,
        protected imgTagInfoCollector: ImgTagInfoCollector,
        protected logger: AnalyzeCmdLogger,
    ) {}

    public async exec() {
        const imgTagsInfo = await this.imgTagInfoCollector.collectImgTagsInfoFromBrowser();
        
        imgTagsInfo.forEach(imgTagInfo => {
            this.processImg(imgTagInfo);
        });

        this.logger.logInfo();
    }

    public processImg(imgInfo: IDomImgInfo) {
        const selector = imgInfo.selector;

        if (!imgInfo.alt) {
            this.logger.lackAltImgSelectors.push(selector);
        }

        if (!imgInfo.src) {
            this.logger.lackSrcImgSelectors.push(selector);
        }

        // TODO add size check
    }
}
