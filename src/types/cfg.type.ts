import { IBreakPoint } from './breakpoint.type.js';
import { ImgFormats } from './img_formats.enum.js';

export interface IUserConfig {
    url: string;
    publicUrl?: string;
    publicDir?: string;
    
    deleteOriginal?: boolean;

    resize?: boolean;
    defaultViewport?: IBreakPoint;
    breakPoints?: IBreakPoint[];
    resizeThreshold?: number;
    breakpointSwitchDelay?: number;
    
    imgNameTemplate?: string;

    convert?: boolean;
    imgFormat?: ImgFormats;

    // detect attrs
    detectNoAltAttr?: boolean;
    detectNoSrcSetAttr?: boolean;
    detectNoSrcAttr?: boolean;
    detectNoSizeAttr?: boolean;
    detectTypeMismatch?: boolean;

    // logs
    log?: boolean;
    logSkipped?: boolean;
    logImgConvert?: boolean;
    logResizes?: boolean;
    logResizesDetailsJson?: boolean;
    logDeleteConverted?: boolean;
}

export type IResultConfig = Required<IUserConfig> & {
    defaultViewport: Required<IBreakPoint>;
    breakPoints: Required<IBreakPoint>[];
};
