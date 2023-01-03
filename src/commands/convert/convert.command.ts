import { Container } from 'typedi';
import { Command } from 'commander';
// import own
import { IUserConfig } from '../../types/cfg.type.js';
import { ConvertCmdBackend } from './convert.backend.js';
import { ImgHelperConfigLoader } from '../../utils/config/config_loader.js';
import { getResultCfg } from '../../utils/config/get_result_cfg.js';
import { parseCliOptions } from '../../utils/cli/parse_cli_options.js';

const command = new Command('convert');

command
    .option('-p --public-dir', 'path to public dir')
    .option('-f --format <format>', 'convert image to specific format (webp | avif)')
    .option('-R --convert-recursive [boolean]', 'convert images recursively')
    .option('--log-skipped [boolean]', 'log warnings for skipped images')
    .option('--log-deleted [boolean]', 'log deleted images after convertation')
    .argument('[convertPath]', 'path to convert images')
    .action(async (cliConvertPath: string, options: Record<string, string>) => {
        const cliCfg = parseCliOptions(options) as unknown as IUserConfig;
        const rootCfg = await ImgHelperConfigLoader.loadFromRoot();

        const cfg = getResultCfg(
            rootCfg,
            cliCfg,
        );

        const pathToConvert = cliConvertPath || cfg.publicDir;

        Container.set('cfg', cfg);
        const cmd = Container.get(ConvertCmdBackend);
        await cmd.exec(pathToConvert);
    });

export const convertCommand = command;
