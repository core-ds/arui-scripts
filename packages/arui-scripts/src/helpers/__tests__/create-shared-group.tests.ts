import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { createSharedGroup } from '../create-shared-group';

describe('createSharedGroup', () => {
    let directory: string;
    let packageJson: string;

    function install(name: string, version: string, exports?: Record<string, string>) {
        const manifest = join(directory, 'node_modules', name, 'package.json');

        mkdirSync(dirname(manifest), { recursive: true });
        writeFileSync(manifest, JSON.stringify({ name, version, exports }));
    }

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), 'shared-group-'));
        packageJson = join(directory, 'package.json');
        writeFileSync(packageJson, JSON.stringify({ name: 'app' }));
        install('react', '18.3.1');
        install('react-dom', '18.3.1');
        install('@company/ui', '42.2.1');
    });

    afterEach(() => rmSync(directory, { recursive: true, force: true }));

    function group(runtime = ['react', 'react-dom']) {
        return createSharedGroup({
            packageJson,
            runtime,
            libraries: ['@company/ui/'],
            eager: true,
        });
    }

    it('generates eager runtime singletons and independent library entries with fallbacks', () => {
        const shared = group();

        expect(shared.react).toMatchObject({
            version: '18.3.1',
            requiredVersion: '18.3.1',
            singleton: true,
            strictVersion: true,
            eager: true,
            packageName: 'react',
        });
        expect(shared['react/'].shareKey).toBe(`${shared.react.shareKey}/`);
        expect(shared['react-dom/'].shareKey).toBe(`${shared['react-dom'].shareKey}/`);
        expect(shared['@company/ui/']).toMatchObject({
            version: '42.2.1',
            requiredVersion: '42.2.1',
            singleton: false,
            strictVersion: true,
            eager: true,
            packageName: '@company/ui',
        });
        expect(shared['@company/ui/'].shareKey).toMatch(/\/$/);
        expect(shared['@company/ui/'].import).toBeUndefined();
    });

    it('ignores runtime order and application directory when computing keys', () => {
        expect(group()).toEqual(group(['react-dom', 'react']));
        const first = group();
        const otherManifest = join(directory, 'nested', 'package.json');

        mkdirSync(dirname(otherManifest));
        writeFileSync(otherManifest, '{}');
        expect(
            createSharedGroup({
                packageJson: otherManifest,
                runtime: ['react', 'react-dom'],
                libraries: ['@company/ui/'],
                eager: true,
            }),
        ).toEqual(first);
    });

    it('isolates the whole group when any exact runtime version changes', () => {
        const first = group();

        install('react', '18.3.2');
        const second = group();

        Object.keys(first).forEach((key) => {
            expect(first[key].shareKey).not.toBe(second[key].shareKey);
        });
    });

    it('does not change keys when only a library version changes', () => {
        const first = group();

        install('@company/ui', '43.0.0');
        expect(group()['@company/ui/'].shareKey).toBe(first['@company/ui/'].shareKey);
        expect(group()['@company/ui/'].version).toBe('43.0.0');
    });

    it('supports library subpaths, overrides, and lazy consumption by default', () => {
        const shared = createSharedGroup({
            packageJson,
            runtime: ['react'],
            libraries: {
                '@company/ui/button': { requiredVersion: '^42.0.0', eager: true },
                '@company/ui/': { requiredVersion: false },
            },
        });

        expect(shared.react.eager).toBe(false);
        expect(shared['@company/ui/button']).toMatchObject({
            version: '42.2.1',
            requiredVersion: '^42.0.0',
            eager: true,
        });
        expect(shared['@company/ui/'].requiredVersion).toBe(false);
    });

    it('reads package metadata even when exports hides both the manifest and the root', () => {
        install('@company/ui', '42.2.1', { './button': './button.js' });
        expect(group()['@company/ui/'].version).toBe('42.2.1');
    });

    it('fails clearly for missing packages and empty or overlapping runtime groups', () => {
        expect(() => group(['missing-runtime'])).toThrow(/missing-runtime/);
        expect(() => group([])).toThrow(/runtime/);
        expect(() =>
            createSharedGroup({
                packageJson,
                runtime: ['react'],
                libraries: ['react/'],
            }),
        ).toThrow(/react/);
        expect(() => group(['react/client'])).toThrow(/runtime/);
    });
});
