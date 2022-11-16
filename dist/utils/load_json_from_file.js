import { promises as fsPromises } from 'fs';
export async function loadJsonFromFile(fileFullPath) {
    const fileContentBuffer = await fsPromises.readFile(fileFullPath);
    const fileContentStr = fileContentBuffer.toString();
    return JSON.parse(fileContentStr);
}
//# sourceMappingURL=load_json_from_file.js.map