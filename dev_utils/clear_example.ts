import { readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { getDevPublicPath } from './get_dev_public_path';

const fn = async () => {
    const publicPath = getDevPublicPath();
    const dirContent = await readdir(publicPath);

    const ignoreNames = [
        'bebop.jpg',
        'hunter.jpg',
    ];

    for await (const fname of dirContent) {
        if (!ignoreNames.includes(fname)) {
            const filePath = join(publicPath, fname);
            await unlink(filePath);
        }
    }
};

fn();
