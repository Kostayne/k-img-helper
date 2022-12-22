import 'reflect-metadata';
import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { Container } from 'typedi';

import { IDomImgInfo } from '../../types/dom_img_info.type.js';
import { IUserConfig } from '../../types/cfg.type.js';
import { getResultCfg } from '../../utils/config/get_result_cfg.js';
import { ImgResizer } from './img_resizer.module.js';
import { IFinalImageInfo } from '../../types/final_img.type.js';
import { IResizedImage } from '../../types/img_resize_result.type.js';

const plaugroundPath = resolve('./src/modules/img_resizer/test/skip_playground');
const origImgPath = join(plaugroundPath, 'bebop.webp');

const cfg = getResultCfg({} as IUserConfig);
Container.set('cfg', cfg);

const resizer = Container.get(ImgResizer);
let skippedResizes: IResizedImage[] = [];

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
        Container.set('cfg', cfg);

        const imgBuff = await readFile(origImgPath);
        const sameSrcImgs: IFinalImageInfo[] = [];

        const resizeResults = await resizer.genereateImgResizes(
            imgInfo,
            origImgPath,
            sameSrcImgs,
            imgBuff,
        );

        skippedResizes = resizeResults.skippedResizes;
    });

    it('Skips already resized imgs', async () => {
        expect(skippedResizes.length).toBe(1);
    });
});
