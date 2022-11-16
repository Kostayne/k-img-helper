import { IImgBreakPointInfo } from './img_breakpoint_info.type.js';

export interface IImgInfo {
    src: string;
    alt: string;
    srcSet: string;

    breakPointsInfo: IImgBreakPointInfo[];
}
