import { IResizesToLogInfo } from '@commands/optimize/types/resizes_to_log.type.js';
import { OptionalCliLogger } from '@utils/loggers/optional_logger.js';

export class ImgResizerLogger extends OptionalCliLogger {    
    public resizesToLog: IResizesToLogInfo[] = [];

    public logAllImgResizes() {
        this.resizesToLog.forEach(resizeInfo => {
            this.logImgRelatedResizesArr(resizeInfo);
            this.logSpace();
        });

        if (this.resizesToLog.length > 0) {
            this.logSpace();
        }
    }

    protected logImgRelatedResizesArr({ imgPath, resizes, selector }: IResizesToLogInfo) {
        if (!this.cfg.logResizes) { 
            return;
        }

        this.logMsg(`Created resizes for "${imgPath}" with selector "${selector}":`);

        this.logMsg(
            JSON.stringify(resizes, null, '\t')
        );
    }
}
