import { Command } from 'commander';
import { kostayneAscii } from '@utils/authors_ascii.js';

const command = new Command('authors');

command.action(() => {
    console.log(kostayneAscii);
    
    console.log();
    console.log('kostayne-dev@yandex.ru');
    console.log('https://github.com/kostayne');
});

export const authorsCommand = command;
