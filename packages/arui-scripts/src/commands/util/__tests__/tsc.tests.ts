import fs from 'fs';
import os from 'os';
import path from 'path';

import { getTscWatchCommand } from '../tsc';

describe('project TypeScript watch command', () => {
    let cwd: string;

    beforeEach(() => {
        cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'arui-tsc-')));
    });

    afterEach(() => fs.rmSync(cwd, { recursive: true, force: true }));

    it.each(['6.0.2', '7.0.2'])('uses the published bin.tsc for TypeScript %s', (version) => {
        const directory = path.join(cwd, 'node_modules/typescript');
        const tsconfig = path.join(cwd, 'tsconfig.json');

        fs.mkdirSync(directory, { recursive: true });
        fs.writeFileSync(
            path.join(directory, 'package.json'),
            JSON.stringify({
                version,
                bin: { tsc: './bin/tsc' },
                exports: { './package.json': './package.json' },
            }),
        );

        expect(getTscWatchCommand(tsconfig)).toEqual([
            path.join(directory, 'bin/tsc'),
            '--watch',
            '--noEmit',
            '--project',
            tsconfig,
            '--skipLibCheck',
        ]);
    });
});
