# K-img-helper
Optimize your images just with one command. It's highly configurable!

<!-- shileds -->
![npm](https://img.shields.io/npm/v/k-img-helper)
![npm](https://img.shields.io/npm/dm/k-img-helper)
![npm](https://img.shields.io/npm/l/k-img-helper)

## Install
```
# if occurs problem with install sharp (linux | macos)
sudo chown -R $USER ~/.npm

npm i -g k-img-helper # globally
npm i -D k-img-helper # locally
yarn add -D k-img-helper # locally
```

## Features
- Convert old formats to webp and deletes if after convertation (optionally)
- Scan site and resize imgs by its client size in certain breakpoints set
- Generate srcset for created resizes
- Detect missing of src, alt attributes

## Usage
Create your config called imghelper.config.json in root of your project.

``` json
{
    "url": "http://127.0.0.1:3000",
    "publicContentUrl": "http://127.0.0.1:3000/static", 
    "publicDir": "./public",
}
```

Run optimization via CLI.
```
k-img-helper optimize # if installed globally
# or
npx k-img-helper optimize # if installed locally
```

## Commands
- `optimize`
- `analyze`
- `authors`
- `help`

## Config
You can configure it by seperate config file or pass options to cli.

Full config file interface:
``` ts
export interface IUserConfig {
    // [defaultValue]

    url: string; // url to your site
    publicUrl?: string; // ["/"] url to your statuc files like "https://mysite.com/static/"
    publicDir?: string; // ["./public"] path to folder with static public content
    
    deleteOriginal?: boolean; // [false] delete png, jpg images after convertation to webp

    resize?: boolean; // [true]
    defaultViewport?: IBreakPoint; // sets fallback values for breakpoints
    breakPoints?: IBreakPoint[]; // { heigth: number, width: number } values in px
    resizeThreshold?: number; //[7] procents difference betweem image size to skip resize
    breakpointSwitchDelay?: number; // how many to wait for js event handle after browser resize
    
    imgNameTemplate?: string; // ['$name_w$width_h$height'] template to name resized images
                              // replaces $name, $width, $height with originally name,
                              // client width & height in px

    convert?: boolean; // [true] image convertation to webp | avif
    imgFormat?: ImgFormats; // ['webp'] format to convert images (webp, avif)

    // [true]
    detectNoAltAttr?: boolean;
    detectNoSrcSetAttr?: boolean;
    detectNoSrcAttr?: boolean;
    detectNoSizeAttr?: boolean;
    detectTypeMismatch?: boolean;

    // [true]
    log?: boolean;
    logSkipped?: boolean;
    logImgConvert?: boolean;
    logResizes?: boolean;
    logDeleteConverted?: boolean;
}
```

Parameters to pass into cli should be in kebab case. Example: detectNoAltAttr becomes detect-no-alt-attr.

## Sources
- [:package: this package on npm](https://www.npmjs.com/package/k-img-helper)
- [:octocat: this package on github](https://github.com/Kostayne/k-img-helper)