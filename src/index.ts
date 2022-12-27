#!/usr/bin/node
import 'reflect-metadata';
import { program } from 'commander';
import { authorsCommand } from './commands/authors.command.js';
import { analyzeCommand } from './commands/analyze/analyze.command.js';
import { optimizeCommand } from './commands/optimize/optimize.command.js';

const asyncWrapper = async () => {
    program
        .name('k-img-helper')
        .description('CLI to optimize your images')
        .version('1.0.8')
        .option('-l, --log', 'enable / disable info log to stdout')
        .addCommand(analyzeCommand)
        .addCommand(optimizeCommand)
        .addCommand(authorsCommand)
        .parse();
};

asyncWrapper();
