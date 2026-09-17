import path from 'path';

import { resolveCommandOptions } from '../config-file';
import { findConfigFile, loadConfigFile } from '../load-config-file';

const fixtures = path.join(__dirname, 'fixtures');

describe('loadConfigFile', () => {
    it('should load a TypeScript config without any extra loader', async () => {
        const config = await loadConfigFile(path.join(fixtures, 'ts-config.ts'));

        expect(config.docker?.baseImage).toBe('fixture/base:1.0.0');
        expect(config.nginx).toEqual({ baseConf: { workerProcesses: 7 } });
        expect(resolveCommandOptions('docker-build:server', config)).toMatchObject({
            docker: { baseImage: 'fixture/base:1.0.0', variant: 'compiled' },
            serverOutput: 'server/index.js',
        });
    });

    it('should load an ESM config exporting an async function', async () => {
        const config = await loadConfigFile(path.join(fixtures, 'fn-config.mjs'));

        expect(config.docker?.baseImage).toBe('fixture/fn:2.0.0');
    });

    it('should load a CommonJS config', async () => {
        const config = await loadConfigFile(path.join(fixtures, 'cjs-config.cjs'));

        expect(config.docker?.baseImage).toBe('fixture/cjs:3.0.0');
    });
});

describe('findConfigFile', () => {
    it('should return null when the project has no config', () => {
        expect(findConfigFile(fixtures)).toBeNull();
    });

    it('should resolve an explicitly passed path relative to cwd', () => {
        expect(findConfigFile(fixtures, './ts-config.ts')).toBe(
            path.join(fixtures, 'ts-config.ts'),
        );
    });

    it('should throw on a missing explicit path instead of silently ignoring it', () => {
        expect(() => findConfigFile(fixtures, './nope.ts')).toThrow('Config file not found');
    });

    it('should auto-detect arui-scripts-artifacts.ts in the project root', () => {
        const cwd = path.join(__dirname, 'fixtures-autodetect');

        expect(findConfigFile(cwd)).toBe(path.join(cwd, 'arui-scripts-artifacts.ts'));
    });
});
