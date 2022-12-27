import { extname } from 'path';
import { Container } from 'typedi';
import { OptionalCliLogger } from './loggers/optional_logger.js';

export function checkNameWithTypeMismatch(imgFullPath: string, ext: string) {
    const extName = extname(imgFullPath);

    if (ext !== extName.replace('.', '')) {
        const logger = Container.get(OptionalCliLogger);
        logger.logWarning(`Image ${imgFullPath} should have .${ext} extention!`);
    }
}
