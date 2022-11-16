import { program } from 'commander';
import { analyzeCommand } from './commands/analyze.command.js';
import { authorsCommand } from './commands/authors.command.js';
import { optimizeCommand } from './commands/optimize.command.js';
import { ImgHelperConfigLoader } from './utils/config/config_loader.js';
import { ConfigStorage } from './utils/config/config_storage.js';

const asyncWrapper = async () => {
    const cfg = await ImgHelperConfigLoader.loadFromRoot();
    ConfigStorage.cfg = cfg;

    program
        .name('k-img-helper')
        .description('CLI to optimize your images')
        .version('0.0.1')
        .option('-l, --log', 'enable / disable info log to stdout')
        .addCommand(analyzeCommand)
        .addCommand(optimizeCommand)
        .addCommand(authorsCommand)
        .parse();
};

asyncWrapper();
