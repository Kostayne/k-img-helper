import { IResizedImage } from '../../../types/img_resize_result.type.js';

export interface IResizesToLogInfo {
    resizes: IResizedImage[];
    selector: string;
    imgPath: string;
}
