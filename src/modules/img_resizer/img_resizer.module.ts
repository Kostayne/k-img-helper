import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { IClientSize } from '../../types/client_size.type.js';
import { IDomImgInfo } from '../../types/dom_img_info.type.js';
import { IFinalImageInfo } from '../../types/final_img.type.js';
import { IResizedImage } from '../../types/img_resize_result.type.js';
import { join, parse as parsePath } from 'node:path';
import { checkFileExistst } from '../../utils/check_file_exists.js';
import { IUserConfig } from '../../types/cfg.type.js';
import { transformSharpImgToFormat } from '../../utils/sharp_img_to_format.js';
import { ImgFormats } from '../../types/img_formats.enum.js';
import { ImgResizerLogger } from './img_resizer.logger.js';

export class ImgResizer {
    constructor(
        protected cfg: IUserConfig,
        protected logger: ImgResizerLogger,
    ) {}

    public async genereateImgResizes(
        imgInfo: IDomImgInfo, 
        imgFullPath: string, 
        sameSrcImgs: IFinalImageInfo[],
        sourceImgBuffer: Buffer,
    ) {
        const resizeResults: IResizedImage[] = [];

        // iterate for all img sizes
        for await (const breakPointInfo of imgInfo.breakPointsInfo) {
            const { breakPoint, clientSize } = breakPointInfo;

            // check for exact resize existance
            const resizedImgPath = this.getNameByClientSize(imgFullPath, clientSize);            
            let resizeAlreadyExists = await checkFileExistst(resizedImgPath);

            const _curResize: IResizedImage = {
                breakPoint,
                clientSize,
                imgPath: resizedImgPath,
            };

            const _pushResizeResult = () => {
                resizeResults.push(_curResize);
            };

            if (resizeAlreadyExists) {
                _pushResizeResult();
                continue;
            }

            // img may be resized before with similar sizes
            for (const sameSrcImg of sameSrcImgs) {
                for (const r of sameSrcImg.resizes) {
                    // size threshold | check
                    const origRes = this.getImgResolution(clientSize);
                    const similarRes = this.getImgResolution(r.clientSize);
                    const resDiff = this.getImgSizeDiffInProcents(origRes, similarRes);

                    // skip if diff is too high
                    // TODO works only for different img tags on page should i do it with same tag?
                    if (resDiff > this.cfg.resizeThreshold) {
                        continue;
                    }

                    resizeAlreadyExists = true;
                    break;
                }

                if (resizeAlreadyExists) {
                    break;
                }
            }

            const resizedBuffer = await this.resizeImg(
                sourceImgBuffer, 
                clientSize, 
                this.cfg.imgFormat
            );

            await writeFile(resizedImgPath, resizedBuffer);
            _pushResizeResult();
        }

        // log if only img have at least one resize
        if (resizeResults.length > 0) {
            this.logger.resizesToLog.push({
                resizes: resizeResults,
                imgPath: imgFullPath,
                selector: imgInfo.selector,
            });
        }

        return { resizes: resizeResults };
    }

    protected async resizeImg(buffer: Buffer, size: IClientSize, format: ImgFormats) {
        const sharpImg = sharp(buffer)
            .resize(size.clientWidth, size.clientHeight);

        transformSharpImgToFormat(sharpImg, format);
        return sharpImg.toBuffer();
    }

    protected getNameByClientSize(origName: string, size: IClientSize) {
        const pathInfo = parsePath(origName);
        const { dir, name, ext } = pathInfo;

        const nameVal = join(dir, name);

        return this.cfg.imgNameTemplate
            .replace('$name', nameVal)
            .replace('$width', size.clientWidth.toString())
            .replace('$height', size.clientHeight.toString())
            + ext;
    }

    protected getImgResolution(size: IClientSize) {
        const { clientHeight, clientWidth } = size;
        return clientHeight * clientWidth;
    }

    protected getImgSizeDiffInProcents(resOne: number, resTwo: number) {
        const biggerRes = Math.max(resOne, resTwo);
        const smallerRes = Math.min(resOne, resTwo);
        const diff = biggerRes - smallerRes;
        const procent = biggerRes / 100;
        return diff / procent;
    }
}
