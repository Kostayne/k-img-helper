import { Inject, Service } from 'typedi';
import puppeteer, { Browser, Page } from 'puppeteer';
import { IRawImageInfo } from '../../types/img_raw_info.type.js';
import { IResultConfig } from '../../types/cfg.type.js';
import { IDomImgInfo } from '../../types/dom_img_info.type.js';
import { IImageBreakPointInfo } from '../../types/img_breakpoint_info.type.js';

@Service()
export class ImgTagInfoCollector {
    protected page: Page;
    protected browser: Browser;
    protected rawImgsInfo: IRawImageInfo[] = [];
    protected publicDirContent: string[] = [];

    constructor(
        @Inject('cfg')
        protected cfg: IResultConfig,
    ) {}

    public async collectImgTagsInfoFromBrowser() {
        await this.setupBrowser();

        for await (const breakPoint of this.cfg.breakPoints) {
            await this.page.setViewport({
                width: breakPoint.width,
                height: breakPoint.height,
            });

            await new Promise(res => {
                setTimeout(res, this.cfg.resizeDelay);
            });

            const rawImgsInfo = await this.getRawImgsInfoFromPage();
            
            rawImgsInfo.forEach(info => {
                this.rawImgsInfo.push({
                    ...info,
                    breakPoint,
                });
            });
        }

        const imgTagsInfo = this.getImgTagsInfo();
        await this.browser.close();

        return imgTagsInfo;
    }

    protected async setupBrowser() {
        this.browser = await puppeteer.launch({
            defaultViewport: this.cfg.defaultBreakPoint,
        });

        this.page = await this.browser.newPage();
        await this.page.goto(this.cfg.url);
    }

    protected async getRawImgsInfoFromPage() {
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
}
