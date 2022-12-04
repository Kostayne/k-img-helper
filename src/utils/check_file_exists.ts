import { promises as fsp } from 'fs';

export async function checkFileExistst(fullPath: string) {
    try {
        await fsp.access(fullPath);
        return true;
    } catch (e) {
        return false;
    }
}
