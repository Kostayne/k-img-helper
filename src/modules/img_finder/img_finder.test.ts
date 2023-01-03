import { resolve } from 'path';
import { ImgFinder } from './img_finder.module.js';

const testDirPath = resolve('./src/modules/img_finder/test');

describe('img fidner module', () => {
    it('finds only top images if search is non recursive', async () => {
        const imgFinder = new ImgFinder();
        const res = await imgFinder.findOldFormatImgs(testDirPath, false);

        expect(res.length).toBe(1);
    });

    it('finds nested images if search is recursive', async () => {
        const imgFinder = new ImgFinder();
        const res = await imgFinder.findOldFormatImgs(testDirPath, true);

        expect(res.length).toBe(2);
        expect(res.some(f => f.endsWith('nested/bebop.jpg'))).toBe(true);
    });
});
