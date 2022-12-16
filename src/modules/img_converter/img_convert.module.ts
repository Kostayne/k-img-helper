import sharp from 'sharp';
import { readFile, writeFile } from 'fs/promises';
import { dirname, join, parse as parsePath } from 'node:path';
// @own imports
import { IResultConfig } from '@type/cfg.type.js';
import { ImgConverterLogger } from './img_converter.logger.js';
import { IImageConvertResult } from './types/img_convert_result.type.js';
import { checkFileExistst } from '@utils/check_file_exists.js';
import { ImgFormats } from '@type/img_formats.enum.js';
import { transformSharpImgToFormat } from '@utils/sharp_img_to_format.js';
import { CliLogger } from '@utils/loggers/cli_logger.js';


export class ImgConverter {
    constructor(protected cfg: IResultConfig, protected logger: ImgConverterLogger) {}

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
