/* eslint-disable @typescript-eslint/no-var-requires, global-require */
import fs from 'fs';
import os from 'os';
import path from 'path';

import { type AppContextWithConfigs } from '../../app-configs/types';

jest.mock('../../app-configs', () => ({
    configs: { tsconfig: null, jestCodeTransformer: 'swc', jestTransformNodeModules: [] },
}));
jest.mock('typescript', () => ({ version: '7.0.2' }));
jest.mock('../../swc', () => ({ swcJestConfig: {} }));

describe('Jest settings without the legacy TypeScript API', () => {
    let directory: string;
    let configs: AppContextWithConfigs;

    beforeEach(() => {
        jest.resetModules();
        ({ configs } = require('../../app-configs'));
        directory = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-jest-tsconfig-'));
        configs.tsconfig = path.join(directory, 'tsconfig.json');
    });

    afterEach(() => {
        fs.rmSync(directory, { recursive: true, force: true });
    });

    it('reads JSONC aliases with comments and trailing commas', () => {
        fs.writeFileSync(
            configs.tsconfig as string,
            `{
            // Project aliases
            "compilerOptions": { "paths": { "@app/*": ["src/*"], "@entry": ["src/index.ts"], }, },
        }`,
        );

        const settings = require('../settings');

        expect(settings.moduleNameMapper).toMatchObject({
            '^@app/(.*)$': '<rootDir>/src/$1',
            '^@entry$': '<rootDir>/src/index.ts',
        });
    });

    it('reports malformed JSONC with its filename', () => {
        fs.writeFileSync(configs.tsconfig as string, '{ "compilerOptions": invalid }');
        expect(() => require('../settings')).toThrow('tsconfig.json');
    });
});
