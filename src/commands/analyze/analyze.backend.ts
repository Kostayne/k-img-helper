import { Inject, Service } from 'typedi';
import { ImgTagInfoCollector } from '../../modules/img_tag_info_collector/img_tag_info_collector.module.js';
import { CmdBackend } from '../../shared/cmd_backend.js';
import { IResultConfig } from '../../types/cfg.type.js';
import { IDomImgInfo } from '../../types/dom_img_info.type.js';
import { AnalyzeCmdLogger } from './analyze.logger.js';

@Service()
export class AnalyzeCmdBackend extends CmdBackend {
    constructor(
        @Inject('cfg')
        protected cfg: IResultConfig,
        protected imgTagInfoCollector: ImgTagInfoCollector,
        protected logger: AnalyzeCmdLogger,
    ) {
        super(cfg);
    }

    public async exec() {
        const imgTagsInfo = await this.imgTagInfoCollector.collectImgTagsInfoFromBrowser();
        
        imgTagsInfo.forEach(imgTagInfo => {
            this.processImg(imgTagInfo);
        });

        this.logger.logInfo();
    }

    public processImg(imgInfo: IDomImgInfo) {
        if (!imgInfo.alt) {
            this.logger.lackAltImgs.push(imgInfo);
        }

        if (!imgInfo.src) {
            this.logger.lackSrcImgs.push(imgInfo);
        }

        // TODO add size check
    }
}
