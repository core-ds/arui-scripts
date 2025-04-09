import fs from 'fs';
import path from 'path';

import { configs } from '../../../configs/app-configs';

export async function getBundleFiles() {
    const files = await fs.promises.readdir(configs.clientOutputPath);

    return files
        .filter((filename) => filename.endsWith('.js') || filename.endsWith('.css'))
        .map((filename) => path.join(configs.clientOutputPath, filename));
}
