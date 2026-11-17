import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import util from 'node:util';

const nodeMakeTmpDir = util.promisify(fs.mkdtemp);

/**
 * Создает и возвращает временную папку
 * @returns {Promise<string>}
 */
export async function makeTmpDir(prefix?: string) {
    return nodeMakeTmpDir(path.join(os.tmpdir(), prefix || ''));
}
