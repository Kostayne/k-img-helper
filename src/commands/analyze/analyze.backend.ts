import { Inject, Service } from 'typedi';
import { fileTypeFromBuffer } from 'file-type';
import { ImgTagInfoCollector } from '../../modules/img_tag_info_collector/img_tag_info_collector.module.js';
import { CmdBackend } from '../../shared/cmd_backend.js';
import { IResultConfig } from '../../types/cfg.type.js';
import { IDomImgInfo } from '../../types/dom_img_info.type.js';
import { readImageBuffer } from '../../utils/read_img_buffer.js';
import { getImageFullPath } from '../../utils/get_img_full_path.js';
import { getImageRelativePathBySrc } from '../../utils/get_img_rel_path_by_src.js';
import { ImgAnalyzer } from '../../modules/img_analyzer/img_analyzer.module.js';
import { IImagePathInfo } from '../../types/img_path_info.type.js';

@Service()
export class AnalyzeCmdBackend extends CmdBackend {
    constructor(
        @Inject('cfg')
        protected cfg: IResultConfig,
        protected imgTagInfoCollector: ImgTagInfoCollector,
        protected analyzer: ImgAnalyzer,
    ) {
        super(cfg);
    }

    public async exec() {
        const imgTagsInfo = await this.imgTagInfoCollector.collectImgTagsInfoFromBrowser();
        
        imgTagsInfo.forEach(imgTagInfo => {
            this.processImg(imgTagInfo);
        });

        this.analyzer.logAnalyzedInfo();
    }

    public async processImg(imgInfo: IDomImgInfo) {
        const imgRelativePath = getImageRelativePathBySrc(imgInfo.src, this.cfg);
        const imgFullPath = getImageFullPath(this.cfg, imgRelativePath);

        const sourceImgBuffer = await readImageBuffer(imgFullPath);
        const { ext } = await fileTypeFromBuffer(sourceImgBuffer);

        const imgPathInfo: IImagePathInfo = {
            fullPath: imgFullPath,
            relativePath: imgRelativePath,
        };

        this.analyzer.analyzeImg(imgInfo, imgPathInfo, ext);
    }
}
