import { promises as fsPromises } from 'fs';

export class KImgHelper {
    async load(cfgFullPath: string) {
        try {
            await fsPromises.stat(cfgFullPath);
        } catch(err) {
            console.error(`Can't read the config!`);
            console.error(err);
            return;
        }
    }
}