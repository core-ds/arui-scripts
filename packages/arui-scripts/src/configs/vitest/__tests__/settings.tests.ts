import fs from 'fs';
import os from 'os';
import path from 'path';

import { getVitestConfig } from '../settings';

jest.mock('vite-tsconfig-paths', () => ({
    __esModule: true,
    default: jest.fn(() => ({ name: 'tsconfig-paths' })),
}));

describe('Vitest project preset', () => {
    let cwd: string;

    beforeEach(() => {
        cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-vitest-test-'));
        jest.spyOn(process, 'cwd').mockReturnValue(cwd);
    });
    afterEach(() => {
        jest.restoreAllMocks();
        fs.rmSync(cwd, { recursive: true, force: true });
    });
    test.each([undefined, {}, { jest: {} }])(
        'uses jsdom and no setup files without configuration: %j',
        (pkg) => {
            if (pkg) fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify(pkg));
            const config = getVitestConfig();

            expect(config.test.environment).toBe('jsdom');
            expect(config.test.setupFiles).toEqual([]);
            expect(config.test.coverage.provider).toBe('v8');
        },
    );
    test('resolves inherited Jest setup files relative to the project', () => {
        fs.writeFileSync(
            path.join(cwd, 'package.json'),
            JSON.stringify({ jest: { setupFiles: ['<rootDir>/setup.ts', 'other.ts'] } }),
        );
        expect(getVitestConfig().test.setupFiles).toEqual([
            path.join(cwd, 'setup.ts'),
            path.join(cwd, 'other.ts'),
        ]);
    });
    test('mocks CSS and assets while leaving source modules alone', () => {
        const plugin = getVitestConfig().plugins[1];

        if (!plugin || !('load' in plugin) || typeof plugin.load !== 'function')
            throw new Error('Missing mock plugin');
        const load = plugin.load as (id: string) => string | undefined;

        expect(load('/src/styles.css')).toBe('export default {}');
        expect(load('/src/icon.svg')).toBe('export default "icon.svg"');
        expect(load('/src/font.woff2')).toBe('export default "font.woff2"');
        expect(load('/src/app.ts')).toBeUndefined();
    });
    test('does not silently ignore an invalid package.json', () => {
        fs.writeFileSync(path.join(cwd, 'package.json'), '{broken');
        expect(getVitestConfig).toThrow(SyntaxError);
    });
});
