export interface IKImgHelperConfig {
    siteUrl: string;
    breakPoints?: string[];
    imgFormat?: string;
    imgSizeTreshold?: number;

    detectNoAltAttr?: boolean;
    detectNoSrcSetAttr?: boolean;
    detectNoSrcAttr?: boolean;
    detectNoSizeAttr?: boolean;
}
