import { fileTypeFromBuffer } from 'file-type';
import { Inject, Service } from 'typedi';
import { extname, join } from 'node:path';
import { readFile, unlink } from 'node:fs/promises';
// import own
import { CmdBackend } from '../../shared/cmd_backend.js';
import { ImgConverter } from '../../modules/img_converter/img_convert.module.js';
import { ImgResizer } from '../../modules/img_resizer/img_resizer.module.js';
import { IResultConfig } from '../../types/cfg.type.js';
import { IClientSize } from '../../types/client_size.type.js';
import { IDomImgInfo } from '../../types/dom_img_info.type.js';
import { IFinalImageInfo } from '../../types/final_img.type.js';
import { IRawImageInfo } from '../../types/img_raw_info.type.js';
import { IResizedImage } from '../../types/img_resize_result.type.js';
import { getImageRelativePathBySrc } from '../../utils/get_img_rel_path_by_src.js';
import { OptimizeCmdLogger } from './optimize.logger.js';
import { ISrcSetLogInfo } from './types/scrset_log_info.type.js';
import { ImgTagInfoCollector } from '../../modules/img_tag_info_collector/img_tag_info_collector.module.js';
import { CliLogger } from '../../utils/loggers/cli_logger.js';
import { readPublicDirContentOrExit } from '../../utils/read_public_dir_content_or_exit.js';

@Service()
export class OptimizeCmdBackend extends CmdBackend {
    protected rawImgsInfo: IRawImageInfo[] = [];
    protected publicDirContent: string[] = [];
    protected finalImgs: IFinalImageInfo[] = [];

    protected convertedImgOriginalPaths: string[] = [];
    protected resizedImgSelectors: string[] = [];

    constructor(
        @Inject('cfg')
        protected cfg: IResultConfig,
        protected imgTagInfoCollector: ImgTagInfoCollector,
        protected imgConverter: ImgConverter,
        protected imgResizer: ImgResizer,
        protected logger: OptimizeCmdLogger,
    ) {
        super(cfg);
    }

    async exec() {
        // if public we can't read public dir, there is no point to do anything
        await readPublicDirContentOrExit(this.cfg);

        const imgTagsInfo = await this.imgTagInfoCollector.collectImgTagsInfoFromBrowser();

        for await (const imgTagInfo of imgTagsInfo) {
            await this.processImg(imgTagInfo);
        }

        await this.deleteConvertedOrigImgs();

        this.logger.logInfo();
    }

    protected getImageFullPath(relPath: string) {
        return join(this.cfg.publicDir, relPath);
    }

    protected async processImg(imgInfo: IDomImgInfo) {
        const relPath = getImageRelativePathBySrc(imgInfo.src, this.cfg);
        const imgFullPath = this.getImageFullPath(relPath);

        let resultImgPath = imgFullPath;
        let sourceImgBuffer = await this.readImageBuffer(imgFullPath);

        // needs for convertation & resize checks
        const sameSrcImgs = this.finalImgs.filter(img => img.src === imgInfo.src);

        // CHECK TYPE MISMATCH BLOCK
        const { ext } = await fileTypeFromBuffer(sourceImgBuffer);
        await this.checkNameWithTypeMismatch(imgFullPath, ext);

        // IMG CONVERTATION BLOCK
        const convertationRes = await this.imgConverter.convertImg(sourceImgBuffer, imgFullPath, ext);

        // needs for srcset generation
        if (convertationRes.converted) {
            this.convertedImgOriginalPaths.push(imgFullPath);
        }

        // destructuring object syntax for let
        ({ resultImgPath, sourceImgBuffer } = convertationRes);

        // RESIZE BLOCK
        let resizes: IResizedImage[] = [];

        if (this.cfg.resize) {
            const resizeRes = await this.imgResizer.genereateImgResizes(
                imgInfo,
                resultImgPath,
                sameSrcImgs,
                sourceImgBuffer,
            );

            resizes = resizeRes.resizes;

            // there is no point to do anything, if there is no resizes
            if (resizes.length > 0) {
                this.resizedImgSelectors.push(imgInfo.selector);
            }
        }

        const srcSet = this.getImgSrcSetByResizes(resizes);

        const srcSetInfo: ISrcSetLogInfo = {
            selector: imgInfo.selector,
            srcset: srcSet,
        };

        this.addSrcSetToLogIfNeeded(srcSetInfo, imgFullPath, imgInfo.selector);

        this.finalImgs.push({
            src: imgInfo.src,
            imgFullPath: resultImgPath,
            resizes,
            srcSet,
        });
    }

    protected async checkNameWithTypeMismatch(imgFullPath: string, ext: string) {
        if (this.cfg.detectTypeMismatch) {
            const extName = extname(imgFullPath);

            if (ext !== extName.replace('.', '')) {
                this.logger.logWarning(`Image ${imgFullPath} should have .${ext} extention!`);
            }
        }
    }

    protected async readImageBuffer(imgFullPath: string) {
        try {
            return readFile(imgFullPath);
        } catch(e) {
            this.logger.logImgSkip(imgFullPath);
            return undefined;
        }
    }

    protected getImgResolution(size: IClientSize) {
        const { clientHeight, clientWidth } = size;
        return clientHeight * clientWidth;
    }

    protected getImgSrcSetByResizes(imgResizes: IResizedImage[]) {
        let srcSet = '';

        const sortedResizes = imgResizes.sort((a, b) => {
            const aRes = this.getImgResolution(a.clientSize);
            const bRes = this.getImgResolution(b.clientSize);
            return aRes - bRes;
        });

        for (let i = 0; i < sortedResizes.length; i++) {
            const r = sortedResizes[i];

            if (i > 0) {
                srcSet += ' ';
            }

            srcSet += `${r.imgPath} ${r.clientSize.clientWidth}w`;

            if (i != sortedResizes.length - 1) {
                srcSet += ',';
            }
        }

        return srcSet;
    }

    protected addSrcSetToLogIfNeeded(srcSetInfo: ISrcSetLogInfo, imgOrigPath: string, selector: string) {
        const convertedImg = this.convertedImgOriginalPaths.find(p => {
            return p === imgOrigPath;
        });

        const resizedImg = this.logger.resizesToLog.find(r => {
            r.selector == selector;
        });

        if (convertedImg || resizedImg) {
            this.logger.srcSetsToLog.push(srcSetInfo);
        }
    }

    protected async deleteConvertedOrigImgs() {
        for await (const imgPath of this.convertedImgOriginalPaths) {
            try {
                await unlink(imgPath);
                this.logger.deletedConvertedImgPaths.push(imgPath);
            } catch(e) {
                CliLogger.logError(`Failed to delete converted img ${imgPath}`);
                CliLogger.logError(e);
            }
        }
    }
}
