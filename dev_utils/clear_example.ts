import { readdir, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const fn = async () => {
    const publicPath = resolve('./example/public');
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
