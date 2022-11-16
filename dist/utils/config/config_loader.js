import { promises as fsPromises } from 'fs';
import { loadJsonFromFile } from '../load_json_from_file.js';
import { logError } from '../log/log_error.js';
export class KImgHelperConfigLoader {
    static async loadFromRoot() {
        return this.loadFrom('./.imghelper.config.json');
    }
    static async loadFrom(filePath) {
        try {
            await fsPromises.stat(filePath);
        }
        catch (err) {
            logError(`Can't open config? Does it exist?`);
            return;
        }
        const cfg = await loadJsonFromFile(filePath);
        return cfg;
    }
}
//# sourceMappingURL=config_loader.js.map