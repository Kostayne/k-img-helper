import { IBreakPoint } from './breakpoint.type.js';

export interface IUserConfig {
    url: string;
    urlImgPrefix?: string;
    publicDir?: string;
    
    resize?: boolean;
    defaultBreakPoint?: IBreakPoint;
    breakPoints?: IBreakPoint[];
    resizeThreshold?: number;

    convert?: boolean;
    imgFormat?: string;

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
}

export type IResultConfig = Required<IUserConfig> & {
    defaultBreakPoint: Required<IBreakPoint>;
    breakPoints: Required<IBreakPoint>[];
};
