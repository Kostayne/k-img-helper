
import { Command } from 'commander';
import { getResultCfg } from '../../utils/config/get_result_cfg.js';
import { IUserConfig } from '../../types/cfg.type.js';
import { ConfigStorage } from '../../utils/config/config_storage.js';
import { OptimizeCmd } from './optimize.backend.js';

const command = new Command('optimize');

command.
    option('-u, --url <url>', 'url to your site')
    .option('--url-image-prefix <url>', 'TODO')
    .option('-f, --format <format>', 'convert image to specific format')
    .option('-c, --convert', 'enable / disable image convertation')
    .option('-s, --size-threshold <percent>', 'how big may be img from optimal size in percents')
    .option('-p, --public-dir', 'path to public dir')
    .option('-r, --resize', 'enables img resize')
    .option('--log-skipped', 'log warnings for skipped images?')
    .option('--log-resizes', 'log info about created img resizes')
    .option('-d, --resizeDelay', 'delay after resizes (needs to wait for js event handle)')
    .action((cliCfg: IUserConfig) => {
        const cfg = getResultCfg(
            ConfigStorage.cfg,
            cliCfg,
        );

        const cmd = new OptimizeCmd(cfg);
        cmd.exec();    
    });

export const optimizeCommand = command;