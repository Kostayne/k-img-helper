import { Inject, Service } from 'typedi';
import { fileTypeFromBuffer } from 'file-type';
import { unlink } from 'fs/promises';
// import own
import { ImgConverter } from '../../modules/img_converter/img_convert.module.js';
import { ImgConverterLogger } from '../../modules/img_converter/img_converter.logger.js';
import { ImgTagInfoCollector } from '../../modules/img_tag_info_collector/img_tag_info_collector.module.js';
import { CmdBackend } from '../../shared/cmd_backend.js';
import { IResultConfig } from '../../types/cfg.type.js';
import { readImageBuffer } from '../../utils/read_img_buffer.js';
import { CliLogger } from '../../utils/loggers/cli_logger.js';
import { ImgFinder } from '../../modules/img_finder/img_finder.module.js';

@Service()
export class ConvertCmdBackend extends CmdBackend {
    constructor(
        @Inject('cfg') protected cfg: IResultConfig,
        protected imgConverter: ImgConverter,
        protected imgConverterLogger: ImgConverterLogger,
        protected imgTagInfoCollector: ImgTagInfoCollector,
        protected imgFinder: ImgFinder,
    ) {
        super(cfg);
    }

    public async exec(pathToConvert: string) {
        const imgFullPaths = await this.imgFinder.findOldFormatImgs(pathToConvert, this.cfg.convertRecursive);

        for (const imgPath of imgFullPaths) {
            await this.processImg(imgPath);
        }

        this.imgConverterLogger.logInfo();
    }
    
    protected async processImg(imgFullPath: string) {
        const sourceImgBuffer = await readImageBuffer(imgFullPath);
        const { ext } = await fileTypeFromBuffer(sourceImgBuffer);

        const res = await this.imgConverter.convertImg(sourceImgBuffer, imgFullPath, ext);

        if (res.converted) {
            // save path to delete it
            if (this.cfg.deleteOriginal) {
                try {
                    await unlink(imgFullPath);
                    this.imgConverterLogger.deletedImgPaths.push(imgFullPath);
                } catch(e) {
                    CliLogger.logError(`Failed to delete ${imgFullPath}`);
                    CliLogger.logError(e);
                }
            }
        }
    }
}
