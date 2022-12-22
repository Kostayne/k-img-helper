import { Command } from 'commander';
import { Container } from 'typedi';
import { IUserConfig } from '../../types/cfg.type.js';
import { ConfigStorage } from '../../utils/config/config_storage.js';
import { getResultCfg } from '../../utils/config/get_result_cfg.js';
import { AnalyzeCmdBackend } from './analyze.backend.js';

const command = new Command('analyze');

command.
    option('-u, --url <url>', 'url to your site')
    .option('-p, --public-dir', 'path to public dir')
    .option('--public-url <url>', 'url to public content')
    .option('--detect-no-alt', 'detects no alt attr in imgs')
    .option('--detect-no-src-set', 'detects no src-set attr in imgs')
    .option('--detect-no-src', 'detects no src attr in imgs')
    .option('--detect-no-size', 'detects no height | width attr in imgs')

    .action((cliCfg: IUserConfig) => {
        const cfg = getResultCfg(
            ConfigStorage.cfg,
            cliCfg,
        );

        Container.set('cfg', cfg);
        const backend = Container.get(AnalyzeCmdBackend);

        backend.exec();
    });

export const analyzeCommand = command;
