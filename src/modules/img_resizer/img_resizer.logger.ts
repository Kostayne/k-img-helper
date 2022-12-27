import { Service } from 'typedi';
import { IResizesToLogInfo } from '../../commands/optimize/types/resizes_to_log.type.js';
import { OptionalCliLogger } from '../../utils/loggers/optional_logger.js';


@Service()
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

    protected logImgRelatedResizesArr({ src, resizes, selector }: IResizesToLogInfo) {
        if (!this.cfg.logResizes) { 
            return;
        }

        this.logMsg(`Created resizes for "${src}" with selector "${selector}"`);

        if (this.cfg.logResizesDetailsJson) {
            this.logMsg(
                JSON.stringify(resizes, null, '\t')
            );
        }
    }
}
