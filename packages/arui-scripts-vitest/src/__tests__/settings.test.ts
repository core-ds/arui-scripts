import fs from 'fs';
import os from 'os';
import path from 'path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { hasProjectVitestConfig } from '../run-vitest';
import { getVitestConfig } from '../settings';

type LoadHook = (id: string) => string | undefined;

function getStaticFilesMockLoad(): LoadHook {
    const plugins = (getVitestConfig().plugins ?? []) as Array<{ name: string; load?: LoadHook }>;
    const plugin = plugins.find((item) => item.name === 'arui-scripts-static-files-mock');

    return plugin?.load as LoadHook;
}

describe('getVitestConfig', () => {
    let cwd: string;
    let tmpDir: string;

    beforeEach(() => {
        cwd = process.cwd();
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-scripts-vitest-'));
        process.chdir(tmpDir);
    });

    afterEach(() => {
        process.chdir(cwd);
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('takes setupFiles from jest settings in package.json', () => {
        fs.writeFileSync(
            path.join(tmpDir, 'package.json'),
            JSON.stringify({ jest: { setupFiles: ['<rootDir>/__tests__/setup.js'] } }),
        );

        expect(getVitestConfig().test?.setupFiles).toEqual([
            path.join(fs.realpathSync(tmpDir), '__tests__/setup.js'),
        ]);
    });

    it('works without package.json', () => {
        expect(getVitestConfig().test?.setupFiles).toEqual([]);
    });

    it('replaces css with empty module and assets with file name', () => {
        const load = getStaticFilesMockLoad();

        expect(load('/app/src/styles.module.css')).toBe('export default {}');
        expect(load('/app/src/icons/clock.svg')).toBe('export default "clock.svg"');
        expect(load('/app/src/index.ts')).toBeUndefined();
    });
});

describe('hasProjectVitestConfig', () => {
    it('detects vitest config in project root', () => {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-scripts-vitest-'));

        try {
            expect(hasProjectVitestConfig(tmpDir)).toBe(false);

            fs.writeFileSync(path.join(tmpDir, 'vitest.config.ts'), 'export default {};');

            expect(hasProjectVitestConfig(tmpDir)).toBe(true);
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });
});
