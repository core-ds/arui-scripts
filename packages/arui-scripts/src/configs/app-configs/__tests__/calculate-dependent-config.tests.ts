import fs from 'fs';
import os from 'os';
import path from 'path';

import { calculateDependentContext } from '../calculate-dependent-config';
import { getDefaultAppConfig, getDefaultAppContext } from '../get-defaults';

describe('derived build paths and dictionary sources', () => {
    let cwd: string;

    beforeEach(() => {
        cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-context-test-'));
    });
    afterEach(() => {
        fs.rmSync(cwd, { recursive: true, force: true });
    });

    test('uses the project runtime version and separates files from previous-build directories', () => {
        const runtime = path.join(cwd, 'node_modules/@babel/runtime');

        fs.mkdirSync(runtime, { recursive: true });
        fs.writeFileSync(path.join(runtime, 'package.json'), '{"version":"7.99.0"}');
        const dictionary = path.join(cwd, 'dictionary.bin');
        const previousBuild = path.join(cwd, 'previous');

        fs.writeFileSync(dictionary, 'dictionary');
        fs.mkdirSync(previousBuild);
        const config = {
            ...getDefaultAppConfig(),
            buildPath: 'dist',
            assetsPath: 'static',
            statsOutputFilename: 'metrics.json',
            dictionaryCompression: {
                dictionaryPath: [dictionary, path.relative(process.cwd(), previousBuild)],
                enablePreviousVersionHeaders: false,
            },
        };
        const result = calculateDependentContext(config, { ...getDefaultAppContext(), cwd });

        expect(result).toMatchObject({
            babelRuntimeVersion: '7.99.0',
            publicPath: 'static/',
            serverOutputPath: path.join(cwd, 'dist'),
            clientOutputPath: path.join(cwd, 'dist/static'),
            statsOutputPath: path.join(cwd, 'dist/metrics.json'),
            watchIgnorePath: ['node_modules', 'dist'],
            compressionPredefinedDictionaryPath: [dictionary],
            compressionPreviousVersionPath: [previousBuild],
        });
    });
    test('falls back to the bundled runtime when the project runtime cannot be read', () => {
        const result = calculateDependentContext(getDefaultAppConfig(), {
            ...getDefaultAppContext(),
            cwd,
        });

        expect(result.babelRuntimeVersion).toMatch(/^7\./);
    });
    test('reports nonexistent dictionary paths instead of silently disabling compression', () => {
        const config = getDefaultAppConfig();

        config.dictionaryCompression.dictionaryPath = [path.join(cwd, 'missing')];
        expect(() => calculateDependentContext(config, { ...getDefaultAppContext(), cwd })).toThrow(
            'ENOENT',
        );
    });
});
