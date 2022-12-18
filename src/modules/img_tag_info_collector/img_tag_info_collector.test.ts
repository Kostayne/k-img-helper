import { Container } from 'typedi';
import { defaultCfg } from '../../shared/default_cfg.js';
import { ImgTagInfoCollector } from './img_tag_info_collector.module.js';

describe('img_tag_info_collector module', () => {
    it('sees conditionally rendered imgs', async () => {
        Container.set('cfg', defaultCfg);
        const collector = Container.get(ImgTagInfoCollector);

        const imgTagsInfo = await collector.collectImgTagsInfoFromBrowser();

        // todo
        expect(imgTagsInfo).not.toBeNull();
    });
});
