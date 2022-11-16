import { promises as fsPromises } from 'fs';

export async function loadJsonFromFile(fileFullPath: string) {
    const fileContentBuffer = await fsPromises.readFile(fileFullPath);
    const fileContentStr = fileContentBuffer.toString();
    return JSON.parse(fileContentStr);
}
