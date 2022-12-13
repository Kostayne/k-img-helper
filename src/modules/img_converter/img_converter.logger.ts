import { IConvertedImgInfo } from '../../commands/optimize/types/convertation_to_log.type.js';
import { OptionalCliLogger } from '../../utils/loggers/optional_logger.js';

export class ImgConverterLogger extends OptionalCliLogger {
    public convertedImgsToLog: IConvertedImgInfo[] = [];

    public logConvertedImgs() {
        this.convertedImgsToLog.forEach(c => {
            this.logImgConvert(c.imgOriginalPath, c.format);
        });

        if (this.convertedImgsToLog.length > 0) {
            this.logSpace();
        }
    }

    protected logImgConvert(filePath: string, resFormat: string) {
        this.logMsg(`Converted "${filePath}" to .${resFormat};`);
    }
}
