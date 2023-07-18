import path from 'path';
import util from 'util';
import fs from 'fs';
import os from 'os';

const nodeMakeTmpDir = util.promisify(fs.mkdtemp);

/**
 * Создает и возвращает временную папку
 * @returns {Promise<string>}
 */
async function makeTmpDir(prefix?: string) {
    return await nodeMakeTmpDir(path.join(os.tmpdir(), prefix || ''));
}

export default makeTmpDir;
