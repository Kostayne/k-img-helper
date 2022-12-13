import sharp from 'sharp';
import { ImgFormats } from '../types/img_formats.enum.js';

export function transformSharpImgToFormat(buffer: sharp.Sharp, format: ImgFormats) {
    switch(format) {
        case ImgFormats.webp:
            buffer.webp();
            break;

        case ImgFormats.avif:
            buffer.avif();
            break;
    }
}
