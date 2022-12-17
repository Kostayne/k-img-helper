import { IBreakPoint } from './breakpoint.type.js';
import { ImgFormats } from './img_formats.enum.js';

export interface IUserConfig {
    url: string;
    urlImgPrefix?: string;
    publicDir?: string;
    
    deleteOriginal?: boolean;

    resize?: boolean;
    defaultBreakPoint?: IBreakPoint;
    breakPoints?: IBreakPoint[];
    resizeThreshold?: number;
    resizeDelay?: number;
    
    imgNameTemplate?: string;

    convert?: boolean;
    imgFormat?: ImgFormats;

    // detect attrs
    detectAltAttr?: boolean;
    detectSrcSetAttr?: boolean;
    detectSrcAttr?: boolean;
    detectSizeAttr?: boolean;
    detectTypeMismatch?: boolean;

    // logs
    log?: boolean;
    logSkipped?: boolean;
    logImgConvert?: boolean;
    logResizes?: boolean;
    logDeleteConverted?: boolean;
}

export type IResultConfig = Required<IUserConfig> & {
    defaultBreakPoint: Required<IBreakPoint>;
    breakPoints: Required<IBreakPoint>[];
};
