import { IImageBreakPointInfo } from './img_breakpoint_info.type.js';

export interface IDomImgInfo {
    src: string;
    alt: string;
    srcSet: string;
    selector: string;

    breakPointsInfo: IImageBreakPointInfo[];
}
