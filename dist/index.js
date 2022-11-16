import { program } from 'commander';
import { analyzeCommand } from './commands/analyze.command.js';
import { optimizeCommand } from './commands/optimize.command.js';
import { KImgHelperConfigLoader } from './utils/config/config_loader.js';
import { ConfigStorage } from './utils/config/config_storage.js';
const asyncWrapper = async () => {
    const cfg = await KImgHelperConfigLoader.loadFromRoot();
    ConfigStorage.cfg = cfg;
    program
        .name('k-img-helper')
        .description('CLI to optimize your images')
        .version('0.0.1')
        .addCommand(analyzeCommand)
        .addCommand(optimizeCommand)
        .parse();
};
asyncWrapper();
//# sourceMappingURL=index.js.map