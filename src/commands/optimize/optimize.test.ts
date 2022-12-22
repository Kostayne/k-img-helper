/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata';
import { Container } from 'typedi';
import { copyFile, readdir, readFile, unlink } from 'fs/promises';
import { join, resolve } from 'path';

import { IUserConfig } from '../../types/cfg.type.js';
import { getResultCfg } from '../../utils/config/get_result_cfg.js';
import { OptimizeCmdBackend } from './optimize.backend.js';
import { testImageTypeImport } from './test/test_lib.js';

const pagePath = resolve('./src/commands/optimize/test/env/index.html');
const publicDirPath = resolve('./src/commands/optimize/test/env/public');
const unoptimizedImgsPath = resolve('./src/commands/optimize/test/unoptimized');

const cfg = getResultCfg({
    breakPoints: [
        {
            height: 1080,
            width: 1920,
        },

        {
            height: 585,
            width: 425,
        },
    ],

    url: `file://${pagePath}`,
    publicUrl: `file://${publicDirPath}`
} as IUserConfig);

Container.set('cfg', cfg);

const resetEnvPublicDir = async () => {
    const pubDirContent = await readdir(publicDirPath);

    const requiredFileNames = [
        'bebop.jpg',
        'hunter.jpg',
    ];

    // del
    for await (const fname of pubDirContent) {
        if (!requiredFileNames.includes(fname)) {
            await unlink(
                join(publicDirPath, fname)
            );
        }
    }

    // copy
    for await (const fname of requiredFileNames) {
        if (!pubDirContent.includes(fname)) {
            await copyFile(
                join(unoptimizedImgsPath, fname),
                join(publicDirPath, fname)
            );
        }
    }
};

describe('optimize command', () => {
    beforeAll(async () => {
        await resetEnvPublicDir();
    });

    // TODO fix jest import error
    // throws cannot use import outside module
    it('can import imageType lib', async () => {
        const buff = await readFile(
            join(publicDirPath, 'bebop.jpg')
        );

        await testImageTypeImport(buff);
        expect(true).toBe(true);
    });

    // it('converts files', async () => {
    //     cfg.resize = false;
    //     cfg.deleteOriginal = false;

    //     const backend = Container.get(OptimizeCmdBackend);
    //     await backend.exec();

    //     const publicDirContent = await readdir(publicDirPath);
    //     expect(publicDirContent.includes('bebop.webp')).toBe(true);
    //     expect(publicDirContent.includes('hunter.webp')).toBe(true);
    // });

    // it('not deletes files if deleteOrig is false', async () => {
    //     const publicDirContent = await readdir(publicDirPath);
    //     expect(publicDirContent.includes('bebop.jpg')).toBe(true);
    //     expect(publicDirContent.includes('hunter.jpg')).toBe(true);
    // });

    // it('deletes converted orig imgs, if deleteOrig option is set', async () => {

    // });
});
