import 'reflect-metadata';
import { Container } from 'typedi';
import { join, parse, resolve } from 'path';
import { copyFile, readdir, readFile, unlink } from 'fs/promises';
import { ImgConverter } from './img_convert.module.js';
import { getResultCfg } from '../../utils/config/get_result_cfg.js';
import { IUserConfig } from '../../types/cfg.type.js';
import { ImgFormats } from '../../types/img_formats.enum.js';

// shared
const cfg = getResultCfg({
    deleteOriginal: false,
} as IUserConfig);

let imgConverter: ImgConverter = null;

// utils...
const playgroundPath = resolve('./src/modules/img_converter/test/optimize_playground');
const skipPlaygroundPath = resolve('./src/modules/img_converter/test/skip_playground');
const unoptimizedPath = resolve('./src/modules/img_converter/test/orig_unoptimized');

const restoreUnoptimized = async () => {
    const imgNames = [
        'bebop.jpg',
        'hunter.jpg',
        'rnd_art.png',
    ];

    const tasks: Promise<void>[] = [];

    imgNames.forEach(n => {
        tasks.push(
            copyFile(
                join(unoptimizedPath, n),
                join(playgroundPath, n),
            )
        );
    });

    await Promise.all(tasks);
};

const deleteConverted = async () => {
    const dirContent = await readdir(playgroundPath);

    const ignoreNames = [
        'bebop.jpg',
        'hunter.jpg',
        'rnd_art.png'
    ];

    for await (const fname of dirContent) {
        if (!ignoreNames.includes(fname)) {
            const filePath = join(playgroundPath, fname);
            await unlink(filePath);
        }
    }
};

const convertImg = async (dirPath: string, fname: string) => {
    const imgOrigPath = join(dirPath, fname);
    const imgBuffer = await readFile(imgOrigPath);
    const ext = parse(fname).ext;    
    return imgConverter.convertImg(imgBuffer, imgOrigPath, ext.replace('.', ''));
};

describe('img converter module', () => {
    beforeAll(async () => {
        await Promise.all([
            restoreUnoptimized(),
            deleteConverted(),
        ]);

        Container.set('cfg', cfg);
        imgConverter = Container.get(ImgConverter);
    });

    it('converts jpg to webp', async () => {
        const convertRes = await convertImg(playgroundPath, 'bebop.jpg');
        expect(convertRes.converted).toBe(true);

        const playgroundContent = await readdir(playgroundPath);         
        expect(playgroundContent.includes('bebop.webp'));
    });

    it('converts png to webp', async () => {
        const convertRes = await convertImg(playgroundPath, 'rnd_art.png');
        expect(convertRes.converted).toBe(true);

        const playgroundContent = await readdir(playgroundPath);         
        expect(playgroundContent.includes('rnd_art.webp'));
    });

    it('converts images to avif', async () => {
        cfg.imgFormat = ImgFormats.avif;
        const convertRes = await convertImg(playgroundPath, 'bebop.jpg');
        expect(convertRes.converted).toBe(true);

        const playgroundContent = await readdir(playgroundPath);         
        expect(playgroundContent.includes('bebop.avif'));
    });

    it('skips already converted files', async () => {
        cfg.imgFormat = ImgFormats.webp;
        const convertRes = await convertImg(skipPlaygroundPath, 'hunter.jpg');
        expect(convertRes.converted).toBe(false);
    });
});
