import { IUserConfig } from '../types/cfg.type.js';
import { ImgFormats } from '../types/img_formats.enum.js';

export const defaultCfg: IUserConfig = {
    url: '',
    publicDir: './public',

    defaultBreakPoint: {
        width: 1920,
        height: 1080,
    },

    breakPoints: [
        {
            width: 1920,
        },

        {
            width: 1024,
        },

        {
            width: 768,
        },

        {
            width: 425,
        },

        {
            width: 375,
        },

        {
            width: 320
        }
    ],

    deleteOriginal: false,

    convert: true,
    imgFormat: ImgFormats.webp,
    resize: true,
    resizeThreshold: 5,
    resizeDelay: 100,

    imgNameTemplate: '$name_w$width_h$height',

    detectAltAttr: true,
    detectSizeAttr: true,
    detectSrcAttr: true,
    detectSrcSetAttr: true,
    detectTypeMismatch: true,

    log: true,
    logSkipped: true,
    logImgConvert: true,
    logResizes: true,
};
