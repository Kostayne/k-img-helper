import { Command } from 'commander';

const command = new Command('analyze');

command.
    option('-u, --url <url>', 'url to your site')
    .option('--detect-alt', 'detects no alt attr in imgs')
    .option('--detect-src-set', 'detects no src-set attr in imgs')
    .option('--detect-src', 'detects no src attr in imgs')
    .option('--detect-size', 'detects no height | width attr in imgs')

    .action((options) => {
       console.log(options); 
    });

export const analyzeCommand = command;
