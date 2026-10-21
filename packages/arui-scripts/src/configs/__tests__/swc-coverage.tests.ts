import fs from 'fs';
import os from 'os';
import path from 'path';

import { rspack } from '@rspack/core';

import { swcClientConfig } from '../swc';

jest.mock('../app-configs', () => ({ configs: { collectCoverage: true } }));
jest.mock('../util/apply-overrides', () => ({
    applyOverrides: (_targets: string[], config: unknown) => config,
}));

describe('SWC coverage instrumentation', () => {
    const originalCwd = process.cwd();
    let projectDir: string;

    beforeEach(() => {
        projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-scripts-swc-coverage-'));
        const consumerPlugin = path.join(projectDir, 'node_modules/swc-plugin-coverage-instrument');

        fs.mkdirSync(consumerPlugin, { recursive: true });
        fs.writeFileSync(
            path.join(consumerPlugin, 'package.json'),
            JSON.stringify({ name: 'swc-plugin-coverage-instrument', main: 'plugin.wasm' }),
        );
        fs.writeFileSync(path.join(consumerPlugin, 'plugin.wasm'), 'incompatible consumer plugin');
        fs.writeFileSync(path.join(projectDir, 'fixture.ts'), 'export const answer: number = 42;');
        process.chdir(projectDir);
    });

    afterEach(() => {
        process.chdir(originalCwd);
        fs.rmSync(projectDir, { recursive: true, force: true });
    });

    it('instruments the bundle with the owned plugin when the consumer has an incompatible copy', async () => {
        const outputDir = path.join(projectDir, 'output');
        const compiler = rspack({
            context: projectDir,
            mode: 'none',
            target: 'node',
            devtool: false,
            entry: './fixture.ts',
            output: { path: outputDir, filename: 'bundle.js' },
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        loader: 'builtin:swc-loader',
                        options: swcClientConfig,
                    },
                ],
            },
        });

        await new Promise<void>((resolve, reject) => {
            compiler.run((error, stats) => {
                compiler.close((closeError) => {
                    if (error || closeError) {
                        reject(error || closeError);
                    } else if (!stats || stats.hasErrors()) {
                        reject(new Error(stats?.toString({ all: false, errors: true })));
                    } else {
                        resolve();
                    }
                });
            });
        });

        expect(fs.readFileSync(path.join(outputDir, 'bundle.js'), 'utf8')).toContain(
            '__coverage__',
        );
    }, 30000);
});
