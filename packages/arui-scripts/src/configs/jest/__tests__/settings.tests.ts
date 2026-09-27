/* eslint-disable global-require, @typescript-eslint/no-var-requires */
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('Jest project preset', () => {
    let directory: string;

    beforeEach(() => {
        jest.resetModules();
        directory = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-jest-test-'));
    });
    afterEach(() => {
        fs.rmSync(directory, { force: true, recursive: true });
    });
    function load(jestCodeTransformer = 'swc', extras: Record<string, unknown> = {}) {
        jest.doMock('../../app-configs', () => ({
            configs: { jestCodeTransformer, jestTransformNodeModules: [], ...extras },
        }));
        jest.doMock('../../swc', () => ({ swcJestConfig: { sourceMaps: true } }));

        return require('../settings');
    }
    test.each(['swc', 'babel', 'tsc'])(
        'selects %s transforms for JavaScript and TypeScript',
        (loader) => {
            const config = load(loader);
            const js = config.transform['^.+\\.jsx?$'];
            const ts = config.transform['^.+\\.tsx?$'];

            expect(loader === 'swc' ? js[0] : js).toBe(
                require.resolve(loader === 'swc' ? '@swc/jest' : '../babel-transform'),
            );
            const transformers = { swc: '@swc/jest', tsc: 'ts-jest', babel: '../babel-transform' };

            expect(loader === 'swc' ? ts[0] : ts).toBe(
                require.resolve(transformers[loader as keyof typeof transformers]),
            );
        },
    );
    test('resolves TypeScript aliases from JSON with comments', () => {
        const tsconfig = path.join(directory, 'tsconfig.json');

        fs.writeFileSync(tsconfig, '{ // aliases\n"compilerOptions":{"paths":{"@/*":["src/*"]}}}');
        expect(load('tsc', { tsconfig }).moduleNameMapper['^@/(.*)$']).toBe('<rootDir>/src/$1');
    });
    test('allows a tsconfig without compilerOptions', () => {
        const tsconfig = path.join(directory, 'tsconfig.json');

        fs.writeFileSync(tsconfig, '{}');
        expect(Object.keys(load('swc', { tsconfig }).moduleNameMapper)).toEqual(['\\.css$']);
    });
    test('transforms explicitly allowed packages, including nested installations', () => {
        const config = load('swc', { jestTransformNodeModules: ['foo.bar', '@scope/pkg'] });
        const ignored = new RegExp(config.transformIgnorePatterns[0]);

        expect(ignored.test('/app/node_modules/foo.bar/index.js')).toBe(false);
        expect(ignored.test('/app/node_modules/parent/node_modules/@scope/pkg/index.js')).toBe(
            false,
        );
        expect(ignored.test('/app/node_modules/fooXbar/index.js')).toBe(true);
        expect(ignored.test('/app/node_modules/other/index.js')).toBe(true);
        expect(ignored.test('C:\\app\\node_modules\\foo.bar\\index.js')).toBe(false);
    });
    test('asset transformer safely escapes file names', () => {
        const transform = require('../file-transform');

        expect(transform.process('', '/images/quote"name.svg')).toEqual({
            code: 'module.exports = "quote\\"name.svg";',
        });
        expect(require('../css-mock')).toEqual({});
    });
});
