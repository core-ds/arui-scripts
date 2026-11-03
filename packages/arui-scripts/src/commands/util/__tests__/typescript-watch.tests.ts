/* eslint-disable @typescript-eslint/no-var-requires, global-require */
import fs from 'fs';
import os from 'os';
import path from 'path';

const { checkTypeScriptWatch } = require('../../../../test-typescript-watch');

describe('TypeScript watch compatibility check', () => {
    let project: string;
    let script: string;

    beforeEach(() => {
        project = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-watch-check-'));
        fs.mkdirSync(path.join(project, 'src'));
        fs.writeFileSync(path.join(project, 'src/index.ts'), 'export const value: number = 42;');
        script = path.join(project, 'watch.cjs');
        fs.writeFileSync(
            script,
            `
            const fs = require('node:fs');
            const path = require('node:path');
            const mode = process.argv[2];
            const filename = path.join(process.cwd(), 'src/index.ts');
            console.error('compiler startup diagnostics');
            if (mode === 'exit') process.exit(2);
            setInterval(() => {}, 1000);
            if (mode === 'silent') return;
            console.log('Found 0 errors. Watching for file changes.');
            if (mode === 'idle') return;
            // Register only after the first edit: that edit is deterministically missed.
            let previous;
            setInterval(() => {
                const content = fs.readFileSync(filename, 'utf8');
                if (previous === undefined) {
                    if (content.includes('wrong')) previous = content;
                    return;
                }
                if (content !== previous) {
                    previous = content;
                    if (content.includes('wrong')) {
                        const output = mode === 'stderr' ? process.stderr : process.stdout;
                        output.write('error TS2322: string is not assignable to number\\n');
                    }
                }
            }, 25);
        `,
        );
    });

    afterEach(() => fs.rmSync(project, { recursive: true, force: true }));

    it.each(['stdout', 'stderr'])(
        'handles watcher registration after readiness (%s)',
        async (stream) => {
            await expect(
                checkTypeScriptWatch([script, stream], project, 2500),
            ).resolves.toBeUndefined();
        },
    );

    it('preserves readiness output when the watcher never reports a change', async () => {
        const result = checkTypeScriptWatch([script, 'idle'], project, 1000);

        await expect(result).rejects.toThrow(/Watch timed out.*change diagnostic/);
        await expect(result).rejects.toThrow('compiler startup diagnostics');
        await expect(result).rejects.toThrow('Found 0 errors');
    });

    it('identifies a timeout before the initial compilation', async () => {
        await expect(checkTypeScriptWatch([script, 'silent'], project, 1000)).rejects.toThrow(
            /Watch timed out.*initial compilation[\s\S]*compiler startup diagnostics/,
        );
    });

    it('reports an early compiler exit with its diagnostics', async () => {
        await expect(checkTypeScriptWatch([script, 'exit'], project, 1000)).rejects.toThrow(
            /Watch exited with 2[\s\S]*compiler startup diagnostics/,
        );
    });
});
