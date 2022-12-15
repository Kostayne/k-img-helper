import sharp from 'sharp';
import imageType from 'image-type';
import puppeteer, { Browser, Page } from 'puppeteer';
import { extname, join } from 'node:path';
import { Cmd } from '../../shared/cmd.js';
import { IRawImageInfo } from '../../types/img_raw_info.type.js';
import { IClientSize } from '../../types/client_size.type.js';
import { IImageBreakPointInfo } from '../../types/img_breakpoint_info.type.js';
import { IFinalImageInfo } from '../../types/final_img.type.js';
import { IResizedImage } from '../../types/img_resize_result.type.js';
import { readFile } from 'node:fs/promises';
import { IDomImgInfo } from '../../types/dom_img_info.type.js';
import { ISrcSetLogInfo } from './types/scrset_log_info.type.js';
import { OptimizeCmdLogger } from './optimize.logger.js';
import { ImgConverter } from '../../modules/img_converter/img_convert.module.js';
import { IResultConfig } from '../../types/cfg.type.js';
import { scanPublicDirContent } from '../../utils/scan_pulbic_dir.js';
import { getImageRelativePathBySrc } from '../../utils/get_img_rel_path_by_src.js';
import { ImgResizer } from '../../modules/img_resizer/img_resizer.module.js';

export class OptimizeCmd extends Cmd {
    protected page: Page;
    protected browser: Browser;
    protected rawImgsInfo: IRawImageInfo[] = [];
    protected publicDirContent: string[] = [];
    protected finalImgs: IFinalImageInfo[] = [];

    protected convertedImgOriginalPaths: string[] = [];
    protected resizedImgSelectors: string[] = [];

    constructor(
        // eslint-disable-next-line no-unused-vars
        protected imgConverter: ImgConverter,
        // eslint-disable-next-line no-unused-vars
        protected imgResizer: ImgResizer,
        // eslint-disable-next-line no-unused-vars
        protected logger: OptimizeCmdLogger,
        protected cfg: IResultConfig,
    ) {
        super(cfg);
    }

    protected async setupBrowser() {
        this.browser = await puppeteer.launch({
            defaultViewport: this.cfg.defaultBreakPoint,
        });

        this.page = await this.browser.newPage();
        await this.page.goto(this.cfg.url);
    }

    async exec() {
        await this.setupBrowser();
        const publicDirContent = await scanPublicDirContent(this.cfg);

        if (publicDirContent === null) {
            process.exit(1);
        }

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
        const relPath = getImageRelativePathBySrc(imgInfo.src, this.cfg);
        const imgFullPath = this.getImageFullPath(relPath);

        let resultImgPath = imgFullPath;
        let sourceImgBuffer = await this.readImageBuffer(imgFullPath);

        // needs for convertation & resize checks
        const sameSrcImgs = this.finalImgs.filter(img => img.src === imgInfo.src);

        // CHECK TYPE MISMATCH BLOCK
        const { ext } = await imageType(sourceImgBuffer);
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
}
