import { IBreakPoint } from './breakpoint.type.js';

export interface IRawImageInfo {
    src: string;
    alt: string;
    srcSet: string;
    height: string;
    width: string;
    clientHeight: number;
    clientWidth: number;
    selector: string;
    breakPoint: IBreakPoint;
}
