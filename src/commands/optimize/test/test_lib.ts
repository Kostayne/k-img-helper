import { fileTypeFromBuffer } from 'file-type';

export function testImageTypeImport(buffer: Buffer) {
    return fileTypeFromBuffer(buffer);
}
