import { IBreakPoint } from './breakpoint.type.js';
import { IClientSize } from './client_size.type.js';

export interface IResizedImage {
    breakPoint: IBreakPoint;
    clientSize: IClientSize;
    imgPath: string;
}
