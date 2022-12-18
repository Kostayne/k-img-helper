import 'reflect-metadata';
import { Container } from 'typedi';
import { IResultConfig } from '../../types/cfg.type.js';
import { IDomImgInfo } from '../../types/dom_img_info.type.js';
import { ImgHelperConfigLoader } from '../../utils/config/config_loader.js';
import { getResultCfg } from '../../utils/config/get_result_cfg.js';
import { ImgTagInfoCollector } from './img_tag_info_collector.module.js';

describe('img_tag_info_collector module', () => {
    let cfg: IResultConfig = null;
    let collector: ImgTagInfoCollector = null;
    let imgTagsInfo: IDomImgInfo[] = [];

    beforeAll(async () => {
        const fileCfg = await ImgHelperConfigLoader.loadFromRoot();
        cfg = getResultCfg(fileCfg);

        Container.set('cfg', cfg);

        collector = Container.get(ImgTagInfoCollector);
        imgTagsInfo = await collector.collectImgTagsInfoFromBrowser();
    });

    it('distinguishes different img tags with same src', () => {
        const diffImgTagsWithSameSrc = imgTagsInfo.filter(img => img.src.endsWith('hunter.jpg'));
        expect(diffImgTagsWithSameSrc.length).toBe(2);
    });

    it('sees conditionally rendered imgs', async () => {
        const img = imgTagsInfo.find(img => img.src.endsWith('bebop.jpg'));
        expect(img).toBeTruthy();
    });
});
