import sharp from 'sharp';
import { Service, Inject } from 'typedi';
import { readFile, writeFile } from 'fs/promises';
import { dirname, join, parse as parsePath } from 'node:path';
// @own imports
import { IResultConfig } from '../../types/cfg.type.js';
import { ImgFormats } from '../../types/img_formats.enum.js';
import { checkFileExistst } from '../../utils/check_file_exists.js';
import { CliLogger } from '../../utils/loggers/cli_logger.js';
import { transformSharpImgToFormat } from '../../utils/sharp_img_to_format.js';
import { ImgConverterLogger } from './img_converter.logger.js';
import { IImageConvertResult } from './types/img_convert_result.type.js';

@Service()
export class ImgConverter {
    constructor(
        @Inject('cfg')
        protected cfg: IResultConfig, 
        protected logger: ImgConverterLogger
    ) {}

    public async convertImg(
        sourceImgBuffer: Buffer,
        imgFullPath: string,
        ext: string,
    ) {
        let resultImgPath = imgFullPath;
        let resultBuffer = sourceImgBuffer;
        let converted = false;

        const _getResult = () => {
            return {
                converted,
                resultImgPath,
                sourceImgBuffer: resultBuffer,
            } as IImageConvertResult;
        };

        if (this.cfg.convert && ext != this.cfg.imgFormat) {
            const pathAfterConvertation = this.getNameWithNewExt(imgFullPath, this.cfg.imgFormat);
            const alreadyConverted = await checkFileExistst(pathAfterConvertation);

            if (alreadyConverted) {
                resultBuffer = await readFile(pathAfterConvertation);
                resultImgPath = pathAfterConvertation;
                return _getResult();
            }

            sourceImgBuffer = await this.convertImgToExt(sourceImgBuffer, this.cfg.imgFormat);
            resultImgPath = pathAfterConvertation;

            try {
                await writeFile(resultImgPath, sourceImgBuffer);
                converted = true;

                this.logger.convertedImgsToLog.push({
                    format: this.cfg.imgFormat,
                    imgOriginalPath: imgFullPath,
                });
            } catch(e) {
                CliLogger.logError(`Could not save converted image "${resultImgPath}"`);
                this.logger.skippedImgPaths.push(imgFullPath);
            }
        }

        return _getResult();
    }

    protected async convertImgToExt(imgBuffer: Buffer, ext: ImgFormats) {
        const processingImg = await sharp(imgBuffer);
        transformSharpImgToFormat(processingImg, ext);
        return processingImg.toBuffer();
    }

    protected getNameWithNewExt(imgFullPath: string, newExt: string) {
        const imgName = parsePath(imgFullPath).name;
        const newImgBaseName = imgName + `.${newExt}`;
        const parentDirPath = dirname(imgFullPath);
        return join(parentDirPath, newImgBaseName);
    }
}
