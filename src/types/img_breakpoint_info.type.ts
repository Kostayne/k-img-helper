import { IBreakPoint } from './breakpoint.type.js';
import { IClientSize } from './client_size.type.js';

export interface IImageBreakPointInfo {
    breakPoint: IBreakPoint;
    clientSize: IClientSize;
    width: string;
    height: string;
}
