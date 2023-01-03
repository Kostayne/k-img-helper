import { Command } from 'commander';
import { Container } from 'typedi';
// import own
import { IUserConfig } from '../../types/cfg.type.js';
import { ImgHelperConfigLoader } from '../../utils/config/config_loader.js';
import { getResultCfg } from '../../utils/config/get_result_cfg.js';
import { AnalyzeCmdBackend } from './analyze.backend.js';

const command = new Command('analyze');

command.
    option('-u, --url <url>', 'url to your site')
    .option('-p, --public-dir <path>', 'path to public dir')
    .option('--public-url <url> [boolean]', 'url to public content')
    .option('--detect-no-alt [boolean]', 'detects no alt attr in imgs')
    .option('--detect-no-src-set [boolean]', 'detects no src-set attr in imgs')
    .option('--detect-no-src [boolean]', 'detects no src attr in imgs')
    .option('--detect-no-size [boolean]', 'detects no height | width attr in imgs')

    .action(async (cliCfg: IUserConfig) => {
        const rootCfg = await ImgHelperConfigLoader.loadFromRoot();

        const cfg = getResultCfg(
            rootCfg,
            cliCfg,
        );

        Container.set('cfg', cfg);
        const backend = Container.get(AnalyzeCmdBackend);

        await backend.exec();
    });

export const analyzeCommand = command;
