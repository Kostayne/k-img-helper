
import { Container } from 'typedi';
import { Command } from 'commander';
import { getResultCfg } from '../../utils/config/get_result_cfg.js';
import { IUserConfig } from '../../types/cfg.type.js';
import { OptimizeCmdBackend } from './optimize.backend.js';
import { ImgHelperConfigLoader } from '../../utils/config/config_loader.js';

const command = new Command('optimize');

command.
    option('-u, --url <url>', 'url to your site')
    .option('-p, --public-dir', 'path to public dir')
    .option('--public-url <url>', 'url to public content')
    .option('-f, --format <format>', 'convert image to specific format (webp | avif)')
    .option('-c, --convert', 'enable / disable image convertation')
    .option('-s, --size-threshold <percent>', 'how big may be img from optimal size in percents')
    .option('-r, --resize', 'enables img resize')
    .option('--log-skipped', 'log warnings for skipped images')
    .option('--log-resizes', 'log info about created img resizes')
    .option('--log-deleted', 'log deleted images after convertation')
    .option('-d, --breakpoint-switch-delay', 'how many to wait for js event handle after browser resize')
    .option('--img-name-template <string>', 'resized img name template, replaces $width & $height with values')
    .action(async (cliCfg: IUserConfig) => {
        const rootCfg = await ImgHelperConfigLoader.loadFromRoot();

        const cfg = getResultCfg(
            rootCfg,
            cliCfg,
        );

        Container.set('cfg', cfg);
        const cmd = Container.get(OptimizeCmdBackend);
        await cmd.exec();
    });

export const optimizeCommand = command;
