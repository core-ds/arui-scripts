import os from 'os';
import path from 'path';

import fs from 'fs-extra';

import { copyStaticAssets } from '../write-files';

describe('copyStaticAssets', () => {
    it('копирует ассеты и возвращает количество скопированных файлов', async () => {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'create-arui-assets-'));

        try {
            const count = await copyStaticAssets(tempDir);

            expect(count).toBe(1);
            expect(await fs.pathExists(path.join(tempDir, '.yarn/releases/yarn-4.9.1.cjs'))).toBe(
                true,
            );
        } finally {
            await fs.remove(tempDir);
        }
    });
});
