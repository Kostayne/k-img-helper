import { OptimizeCmd } from '../commands/optimize.command.js';
import { ImgHelperConfigLoader } from '../utils/config/config_loader.js';
import { ConfigStorage } from '../utils/config/config_storage.js';

const asyncWrapper = async () => {
    const cfg = await ImgHelperConfigLoader.loadFromRoot();
    ConfigStorage.cfg = cfg;

    // eslint-disable-next-line no-unused-vars
    const cmd = new OptimizeCmd(cfg);
};

asyncWrapper();
