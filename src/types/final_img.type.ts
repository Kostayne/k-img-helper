import { IResizedImage } from './img_resize_result.type.js';

export interface IFinalImageInfo {
    src: string;
    imgFullPath: string;
    resizes: IResizedImage[];
    srcSet: string;
}
