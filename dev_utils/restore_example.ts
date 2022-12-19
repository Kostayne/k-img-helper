import { copyFile } from 'fs/promises';
import { join, resolve } from 'path';
import { getDevPublicPath } from './get_dev_public_path';

const fn = async () => {
    const publicPath = getDevPublicPath();
    const unoptimizedPath = resolve('./example/unoptimized');

    const bebop = 'bebop.jpg';
    const hunter = 'hunter.jpg';

    await copyFile(
        join(unoptimizedPath, bebop),
        join(publicPath, bebop),
    );

    await copyFile(
        join(unoptimizedPath, hunter),
        join(publicPath, hunter),
    );
};

fn();
