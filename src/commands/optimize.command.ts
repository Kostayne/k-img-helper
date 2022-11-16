import puppeteer, { Browser, Page } from 'puppeteer';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { Command } from 'commander';
import { dirname, extname, join, parse } from 'node:path';
import { getResultCfg } from '../utils/config/get_result_cfg.js';
import { Cmd } from '../shared/cmd.js';
import { IUserConfig } from '../types/cfg.type.js';
import { IImgInfo } from '../types/img_info.type.js';
import { ConfigStorage } from '../utils/config/config_storage.js';
import { OptimizeConfigValidator } from '../utils/config/validators/optimize_config.validator.js';
import imageType from 'image-type';
import sharp from 'sharp';
import { IImgRawInfo } from '../types/img_raw_info.type.js';

const command = new Command('optimize');

export class OptimizeCmd extends Cmd {
    protected publicDirContent: string[] = [];
    protected cfgValidator = new OptimizeConfigValidator();
    protected browser: Browser;
    protected page: Page;
    
    async setupBrowser() {
        this.browser = await puppeteer.launch({
            defaultViewport: this.cfg.defaultBreakPoint,
        });

        this.page = await this.browser.newPage();
        await this.page.goto(this.cfg.url);
    }

    async exec() {
        await this.setupBrowser();
        await this.scanPublicDirContent();

        for await (const breakPoint of this.cfg.breakPoints || []) {
            await this.page.setViewport({
                width: breakPoint.width,
                height: breakPoint.height,
            });

            const imgsInfo = await this.getImgsInfo();
            
            // return;
            // const imgRelativePaths = await this.getDeduplicatedImgRelativePaths(imgsInfo);
            // const imgFullPaths = imgRelativePaths.map(imgRelPath => join(this.cfg.publicDir, imgRelPath));
            
            // for await (const imgPath of imgFullPaths) {
            //     await this.processImg(imgPath);
            // }
        }

        await this.browser.close();
    }

    async scanPublicDirContent() {
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

    async getImgsInfo() {
        const imgsInfo: IImgRawInfo[] = await this.page.$$eval(
            'img', 

            imgs => imgs.map(
                img => {
                    const computedStyles = window.getComputedStyle(img);

                    return {
                        src: img.src,
                        height: computedStyles.height,
                        width: computedStyles.width,
                        clientHeight: img.clientHeight,
                        clientWidth: img.clientWidth,
                        srcSet: img.srcset,
                        alt: img.alt,
                    };
                }
            )
        );

        return imgsInfo;

        // return this.page.evaluate(() => {
        //     const imgs = document.querySelectorAll('img');

        // });
    }

    async getDeduplicatedImgRelativePaths(imgsInfo: IImgInfo[]) {
        const allPaths = imgsInfo.map(img => {
            let res = img.src.replace(this.cfg.urlImgPrefix || this.cfg.url, '');

            if (res[0] == '/') {
                res = res.replace('/', '');
            }

            return res;
        });

        return Array.from(new Set(allPaths));
    }

    async checkNameWithTypeMismatch(imgFullPath: string, imgBuffer: Buffer, ext: string) {
        if (this.cfg.detectTypeMismatch) {
            const extName = extname(imgFullPath);

            if (ext !== extName.replace('.', '')) {
                this.logger.logWarning(`Image ${imgFullPath} should have .${ext} extension!`);
            }
        }
    }

    async convertImgToExt(imgFullPath: string, imgBuffer: Buffer, ext: string) {
        const processingImg = await sharp(imgBuffer);
        this.logger.logImgConvert(imgFullPath, this.cfg.imgFormat);

        switch(ext) {
            case 'webp':
                processingImg.webp();
                break;

            case 'avif':
                processingImg.avif();
                break;
        }

        const resBuffer = await processingImg.toBuffer();
        return resBuffer;
    }

    renameImgToNewExt(imgFullPath: string, newExt: string) {
        const imgName = parse(imgFullPath).name;
        const newImgBaseName = imgName + `.${newExt}`;
        const parentDirPath = dirname(imgFullPath);
        return join(parentDirPath, newImgBaseName);
    }

    async processImg(imgFullPath: string) {
        let imgBuffer: Buffer = null;

        try {
            imgBuffer = await readFile(imgFullPath);
        } catch(e) {
            this.logger.logImgSkip(imgFullPath);
            return;
        }

        const { ext } = await imageType(imgBuffer);
        await this.checkNameWithTypeMismatch(imgFullPath, imgBuffer, ext);

        let resultImgPath = imgFullPath;

        if (this.cfg.convert && ext != this.cfg.imgFormat) {
            imgBuffer = await this.convertImgToExt(imgFullPath, imgBuffer, ext);
            resultImgPath = this.renameImgToNewExt(imgFullPath, this.cfg.imgFormat);
        }

        // TODO resize

        try {
            await writeFile(resultImgPath, imgBuffer);
        } catch(e) {
            this.logger.logError(`Can't write file: ${resultImgPath}`);
            this.logger.logError(e);
        }
    }
}

command.
    option('-u, --url <url>', 'url to your site')
    .option('--url-image-prefix <url>', 'TODO')
    .option('-f, --format <format>', 'convert image to specific format')
    .option('-c, --convert', 'enable / disable image convertation')
    .option('-s, --size-threshold <percent>', 'how big may be img from optimal size in percents')
    .option('-p, --public-dir', 'path to public dir')
    .option('--log-skipped', 'log warnings for skipped images?')
    .action((cliCfg: IUserConfig) => {
        const cfg = getResultCfg(
            ConfigStorage.cfg,
            cliCfg,
        );

        const cmd = new OptimizeCmd(cfg);
        cmd.exec();    
    });

export const optimizeCommand = command;
