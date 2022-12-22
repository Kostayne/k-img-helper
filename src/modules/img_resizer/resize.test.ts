import 'reflect-metadata';
import { readdir, readFile, unlink } from 'fs/promises';
import { join, resolve } from 'path';
import { Container } from 'typedi';

import { IDomImgInfo } from '../../types/dom_img_info.type.js';
import { IUserConfig } from '../../types/cfg.type.js';
import { getResultCfg } from '../../utils/config/get_result_cfg.js';
import { ImgResizer } from './img_resizer.module.js';
import { IFinalImageInfo } from '../../types/final_img.type.js';
import { IResizedImage } from '../../types/img_resize_result.type.js';

const playgroundPath = resolve('./src/modules/img_resizer/test/resize_playground');
const origImgPath = join(playgroundPath, 'bebop.webp');

const cfg = getResultCfg({} as IUserConfig);
Container.set('cfg', cfg);

const resizer = Container.get(ImgResizer);
let resizeRes: IResizedImage = null;
let playgroundFileNames: string[] = [];

const deleteResizes = async () => {
    const dirContent = await readdir(playgroundPath);

    for await (const fname of dirContent) {
        if (fname != 'bebop.webp') {
            const filePath = join(playgroundPath, fname);
            await unlink(filePath);
        }
    }
};

const imgInfo = {
    alt: 'bebop',
    src: 'bebop.webp',
    selector: 'html > .test-selector',
    breakPointsInfo: [
        {
            breakPoint: {
                height: 250,
                width: 350,
            },

            clientSize: {
                clientHeight: 190,
                clientWidth: 304,
            },
        }
    ]
} as IDomImgInfo;

describe('img resizer module', () => {    
    beforeAll(async () => {
        await deleteResizes();
        Container.set('cfg', cfg);

        const imgBuff = await readFile(origImgPath);
        const sameSrcImgs: IFinalImageInfo[] = [];

        const resizeResults = await resizer.genereateImgResizes(
            imgInfo,
            origImgPath,
            sameSrcImgs,
            imgBuff,
        );

        const res = resizeResults.resizes[0];
        resizeRes = res;

        const dirContent = await readdir(playgroundPath);
        playgroundFileNames = dirContent;
    });

    it('generates resizes for breakpoints', async () => {
        expect(playgroundFileNames.length).toBe(2);
    });

    it('generates resizes with correct names', async () => {
        expect(playgroundFileNames.includes('bebop_w304_h190.webp')).toBe(true);
    });

    it('crops img with correct size', async () => {
        expect(resizeRes.clientSize).toEqual(imgInfo.breakPointsInfo[0].clientSize);
    });
});

