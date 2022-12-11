import sharp from 'sharp';
import imageType from 'image-type';
import puppeteer, { Browser, Page } from 'puppeteer';
import { Cmd } from '../../shared/cmd.js';
import { IRawImageInfo } from '../../types/img_raw_info.type.js';
import { IClientSize } from '../../types/client_size.type.js';
import { IImageBreakPointInfo } from '../../types/img_breakpoint_info.type.js';
import { IFinalImageInfo } from '../../types/final_img.type.js';
import { IResizedImage } from '../../types/img_resize_result.type.js';
import { checkFileExistst } from '../../utils/check_file_exists.js';
import { ImgFormats } from '../../types/img_formats.enum.js';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, parse as parsePath } from 'node:path';
import { IDomImgInfo } from '../../types/dom_img_info.type.js';
import { ISrcSetLogInfo } from './types/scrset_log_info.type.js';

export class OptimizeCmd extends Cmd {
    protected rawImgsInfo: IRawImageInfo[] = [];
    protected publicDirContent: string[] = [];
    protected finalImgs: IFinalImageInfo[] = [];
    protected browser: Browser;
    protected page: Page;

    protected async setupBrowser() {
        this.browser = await puppeteer.launch({
            defaultViewport: this.cfg.defaultBreakPoint,
        });

        this.page = await this.browser.newPage();
        await this.page.goto(this.cfg.url);
    }

    async exec() {
        await this.setupBrowser();
        await this.scanPublicDirContent();

        for await (const breakPoint of this.cfg.breakPoints) {
            await this.page.setViewport({
                width: breakPoint.width,
                height: breakPoint.height,
            });

            await new Promise(res => {
                setTimeout(res, this.cfg.resizeDelay);
            });

            const imgsInfo = await this.getImgsInfo();
            
            imgsInfo.forEach(info => {
                this.rawImgsInfo.push({
                    ...info,
                    breakPoint,
                });
            });
        }

        const imgTagsInfo = this.getImgTagsInfo();

        for (const imgInfo of imgTagsInfo) {
            await this.processImg(imgInfo);
        }

        this.logger.logInfo();

        await this.browser.close();
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

    protected async scanPublicDirContent() {
        if (!this.cfg.publicDir) {
            return;
        }

        try {
            this.publicDirContent = await readdir(this.cfg.publicDir);
        } catch(e) {
            this.logger.logError('Can\'t open specified public folder, does it exist?');
            process.exit(1);
        }
    }

    protected async getImgsInfo() {
        const imgsInfo: IRawImageInfo[] = await this.page.$$eval(
            'img', 

            imgs => imgs.map(
                img => {
                    const computedStyles = window.getComputedStyle(img);

                    const generateQuerySelector = (el: Element): string => {
                        if (el.tagName.toLowerCase() == 'html')
                            return 'HTML';

                        let str = el.tagName;
                        str += (el.id != '') ? '#' + el.id : '';

                        if (el.className) {
                            const classes = el.className.split(/\s/);
                            for (let i = 0; i < classes.length; i++) {
                                str += '.' + classes[i];
                            }
                        }

                        return generateQuerySelector(el.parentNode as Element) + ' > ' + str;
                    };

                    return {
                        alt: img.alt,
                        src: img.src,
                        srcSet: img.srcset,
                        height: computedStyles.height,
                        width: computedStyles.width,
                        clientHeight: img.clientHeight,
                        clientWidth: img.clientWidth,
                        selector: generateQuerySelector(img),
                    } as IRawImageInfo;
                }
            )
        );

        return imgsInfo;
    }

    protected getImageRelativePath(imgSrc: string) {
        const { urlImgPrefix, url } = this.cfg;

        // relative to public dir
        let relPath = imgSrc.replace(urlImgPrefix || url, '');

        if (relPath[0] == '/') {
            relPath = relPath.replace('/', '');
        }

        return relPath;
    }

    protected getImageFullPath(relPath: string) {
        return join(this.cfg.publicDir, relPath);
    }

    protected getImgTagsInfo() {
        const res: IDomImgInfo[] = [];

        for (const rawImg of this.rawImgsInfo) {
            const domImgInfo = res.find(info => info.selector == rawImg.selector);
            // if we found imgInfo in result array we only append breakPoint info to it

            const breakPointInfo = {
                breakPoint: rawImg.breakPoint,
                height: rawImg.height,
                width: rawImg.width,
                
                clientSize: {
                    clientHeight: rawImg.clientHeight,
                    clientWidth: rawImg.clientWidth,
                },
            } as IImageBreakPointInfo;

            if (!domImgInfo) {
                res.push({
                    alt: rawImg.alt,
                    selector: rawImg.selector,
                    src: rawImg.src,
                    srcSet: rawImg.srcSet,

                    breakPointsInfo: [
                        breakPointInfo,
                    ],
                });

                continue;
            }

            domImgInfo.breakPointsInfo.push(breakPointInfo);
        }

        return res;
    }

    protected async processImg(imgInfo: IDomImgInfo) {
        const relPath = this.getImageRelativePath(imgInfo.src);
        const imgFullPath = this.getImageFullPath(relPath);

        let resultImgPath = imgFullPath;
        let sourceImgBuffer = await this.readImageBuffer(imgFullPath);

        // needs for convertation & resize checks
        const sameSrcImgs = this.finalImgs.filter(img => img.src === imgInfo.src);

        const convertationRes = await this.handleImgConvertation(
            sourceImgBuffer, 
            imgFullPath,
        );

        // destructuring object syntax for let
        ({ resultImgPath, sourceImgBuffer } = convertationRes);

        let resizes: IResizedImage[] = [];

        if (this.cfg.resize) {
            const { resizes: imgResizes, resizesToLog } = await this.handleImgResizes(
                imgInfo, 
                resultImgPath, 
                sameSrcImgs,
                sourceImgBuffer
            );

            resizes = imgResizes;

            // there is no point to log empty arr
            if (resizesToLog.length > 0) {
                this.logger.resizesToLog.push({
                    imgPath: imgFullPath,
                    resizes: resizesToLog,
                    selector: imgInfo.selector,
                });
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

    /**
     * @description saves img in new format if needed & returns path to it
     */
    protected async handleImgConvertation(
        sourceImgBuffer: Buffer,
        imgFullPath: string,
    ) {
        const { ext } = await imageType(sourceImgBuffer);
        await this.checkNameWithTypeMismatch(imgFullPath, ext);

        let resultImgPath = imgFullPath;
        let resultBuffer = sourceImgBuffer;

        const _getResult = () => {
            return {
                resultImgPath,
                sourceImgBuffer: resultBuffer,
            };
        };

        if (this.cfg.convert && ext != this.cfg.imgFormat) {
            const pathAfterConvertation = this.getNameWithNewExt(imgFullPath, this.cfg.imgFormat);
            const alreadyConverted = await checkFileExistst(pathAfterConvertation);

            if (alreadyConverted) {
                resultBuffer = await readFile(pathAfterConvertation);
                resultImgPath = pathAfterConvertation;
                return _getResult();
            }

            sourceImgBuffer = await this.convertImgToExt(imgFullPath, sourceImgBuffer, this.cfg.imgFormat);
            resultImgPath = pathAfterConvertation;

            try {
                await writeFile(resultImgPath, sourceImgBuffer);

                this.logger.convertedImgsToLog.push({
                    format: this.cfg.imgFormat,
                    imgOriginalPath: imgFullPath,
                });
            } catch(e) {
                this.logger.logError(`Could not save converted image "${resultImgPath}"`);
            }
        }

        return _getResult();
    }

    // TODO break this into individual fn
    protected async handleImgResizes(
        imgInfo: IDomImgInfo, 
        imgFullPath: string, 
        sameSrcImgs: IFinalImageInfo[],
        sourceImgBuffer: Buffer,
    ) {
        const resizeResults: IResizedImage[] = [];
        const resizesToLog: IResizedImage[] = [];

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

            const _pushResizeToLog = () => {
                resizesToLog.push(_curResize);
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
            _pushResizeToLog();
            _pushResizeResult();
        }

        return { resizes: resizeResults, resizesToLog };
    }

    protected async resizeImg(buffer: Buffer, size: IClientSize, format: ImgFormats) {
        const sharpImg = sharp(buffer)
            .resize(size.clientWidth, size.clientHeight);

        this.transformSharpImgToFormat(sharpImg, format);
        return sharpImg.toBuffer();
    }

    protected async readImageBuffer(imgFullPath: string) {
        try {
            return readFile(imgFullPath);
        } catch(e) {
            this.logger.logImgSkip(imgFullPath);
            return undefined;
        }
    }

    protected async convertImgToExt(imgFullPath: string, imgBuffer: Buffer, ext: ImgFormats) {
        const processingImg = await sharp(imgBuffer);
        this.transformSharpImgToFormat(processingImg, ext);
        return processingImg.toBuffer();
    }

    protected getNameWithNewExt(imgFullPath: string, newExt: string) {
        const imgName = parsePath(imgFullPath).name;
        const newImgBaseName = imgName + `.${newExt}`;
        const parentDirPath = dirname(imgFullPath);
        return join(parentDirPath, newImgBaseName);
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

    protected transformSharpImgToFormat(buffer: sharp.Sharp, format: ImgFormats) {
        switch(format) {
            case ImgFormats.webp:
                buffer.webp();
                break;

            case ImgFormats.avif:
                buffer.avif();
                break;
        }
    }

    protected addSrcSetToLogIfNeeded(srcSetInfo: ISrcSetLogInfo, imgOrigPath: string, selector: string) {
        const convertedImg = this.logger.convertedImgsToLog.find(info => {
            return info.imgOriginalPath == imgOrigPath;
        });

        const resizedImg = this.logger.resizesToLog.find(r => {
            r.selector == selector;
        });

        if (convertedImg || resizedImg) {
            this.logger.srcSetsToLog.push(srcSetInfo);
        }
    }
}
