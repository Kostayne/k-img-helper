import glob from 'glob';
import { resolve } from 'path';
import { Service } from 'typedi';
import { sep as windowsSeperator } from 'path/win32';
import { sep as unixSeperator } from 'path/posix';
// import own
import { CliLogger } from '../../utils/loggers/cli_logger.js';

@Service()
export class ImgFinder {
    public async findOldFormatImgs(dirPath: string, recursive = true) {
        let fullPublicPath = resolve(dirPath);

        if (process.platform == 'win32') {
            fullPublicPath = this.convertWindowsPathToUnix(fullPublicPath);
        }

        // slash at the end is necessary
        if (!fullPublicPath.endsWith('/')) {
            fullPublicPath += '/';
        }

        const namePrefix = recursive? '**/*' : '*';
        const pattern = `${fullPublicPath}${namePrefix}.@(png|jpeg|jpg|gif)`;

        // promise polyfill
        return new Promise<string[]>((res, rej) => {
            glob(pattern, (err, matches) => {
                if (err) {
                    CliLogger.logError(err.message);
                    rej(err);
                }

                res(matches);
            });
        });
    }

    protected convertWindowsPathToUnix(path: string) {
        return path.split(windowsSeperator).join(unixSeperator);
    }
}
