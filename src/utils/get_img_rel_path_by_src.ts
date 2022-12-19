import { IUserConfig } from '../types/cfg.type.js';

export function getImageRelativePathBySrc(imgSrc: string, cfg: IUserConfig) {
    const { publicContentUrl: urlImgPrefix, url } = cfg;

    // relative to public dir
    let relPath = imgSrc.replace(urlImgPrefix || url, '');

    if (relPath[0] == '/') {
        relPath = relPath.replace('/', '');
    }

    return relPath;
}
