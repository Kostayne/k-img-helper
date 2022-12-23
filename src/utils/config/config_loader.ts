import { promises as fsPromises } from 'fs';
import { IUserConfig } from '../../types/cfg.type.js';
import { loadJsonFromFile } from '../load_json_from_file.js';

export class ImgHelperConfigLoader {
    static async loadFromRoot() {
        return this.loadFrom('./imghelper.config.json');
    }

    static async loadFrom(filePath: string) {
        try {
            await fsPromises.stat(filePath);
        } catch(err) {
            return null;
        }

        const cfg = await loadJsonFromFile(filePath);
        return cfg as IUserConfig;
    }
}
