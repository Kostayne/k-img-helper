import puppeteer from 'puppeteer';
import { readdir, readFile } from 'node:fs/promises';
import { Command } from "commander";
import { join } from 'node:path';
import { getResultCfg } from '../utils/config/get_result_cfg.js';
import { Cmd } from '../shared/cmd.js';
import { ConfigStorage } from '../utils/config/config_storage.js';
import { OptimizeConfigValidator } from '../utils/config/validators/optimize_config.validator.js';
import { logError } from '../utils/log/log_error.js';
const command = new Command('optimize');
class OptimizeCmd extends Cmd {
    publicDirContent = [];
    cfgValidator = new OptimizeConfigValidator();
    browser;
    page;
    async setupBrowser() {
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
        await this.page.setViewport({
            width: 1920,
            height: 1080
        });
        await this.page.goto(this.cfg.url);
    }
    async scanPublicDirContent() {
        if (!this.cfg.publicDir) {
            return;
        }
        try {
            this.publicDirContent = await readdir(this.cfg.publicDir);
        }
        catch (e) {
            logError(`Can't open specified public folder, does it exist?`);
            process.exit(1);
        }
    }
    async getImgsInfo() {
        const imgsInfo = await this.page.$$eval('img', imgs => imgs.map(img => {
            return {
                src: img.src,
                height: img.height,
                width: img.width,
                clientHeight: img.clientHeight,
                clientWidth: img.clientWidth,
                srcSet: img.srcset,
                alt: img.alt,
            };
        }));
        return imgsInfo;
    }
    async getDeduplicatedImgRelativePaths(imgsInfo) {
        const allPaths = imgsInfo.map(img => {
            let res = img.src.replace(this.cfg.url, '');
            if (res[0] == '/') {
                return res.replace('/', '');
            }
        });
        return Array.from(new Set(allPaths));
    }
    async processImg(imgFullPath) {
        let imgBuffer = null;
        try {
            imgBuffer = await readFile(imgFullPath);
            // const imgTypeInfo = await imageType(imgBuffer);
            // console.log(imgTypeInfo);
        }
        catch (e) {
            logError(`Can't process file: ${imgFullPath}`);
        }
    }
    async exec() {
        await this.setupBrowser();
        await this.scanPublicDirContent();
        const imgsInfo = await this.getImgsInfo();
        const imgRelativePaths = await this.getDeduplicatedImgRelativePaths(imgsInfo);
        const imgFullPaths = imgRelativePaths.map(imgRelPath => join(this.cfg.publicDir, imgRelPath));
        for await (const imgPath of imgFullPaths) {
            await this.processImg(imgPath);
        }
        await this.browser.close();
    }
}
command.
    option('-u, --url <url>', 'url to your site')
    .option('-f, --format <format>', 'convert image to specific format')
    .option('-s, --size-treshold <percent>', 'how big may be img from optimal size in percents')
    .option('-p, --public-dir', 'path to public dir')
    .action((cliCfg) => {
    const cfg = getResultCfg(ConfigStorage.cfg, cliCfg);
    const cmd = new OptimizeCmd(cfg);
    cmd.exec();
});
export const optimizeCommand = command;
//# sourceMappingURL=optimize.command.js.map