import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { getTscWatchCommand, resolveTscBin } from '../tsc';

describe('tsc', () => {
    describe('resolveTscBin', () => {
        let tmpDir: string;

        function writePackageJson(packageJson: Record<string, unknown>) {
            const file = path.join(tmpDir, 'package.json');

            fs.writeFileSync(file, JSON.stringify(packageJson));

            return file;
        }

        beforeEach(() => {
            tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-scripts-tsc-'));
        });

        afterEach(() => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

        it('should resolve tsc from the bin field with a leading dot (typescript 5 and 6)', () => {
            const file = writePackageJson({
                bin: { tsc: './bin/tsc', tsserver: './bin/tsserver' },
            });

            expect(resolveTscBin(file)).toBe(path.join(tmpDir, 'bin', 'tsc'));
        });

        it('should resolve tsc from the bin field without a leading dot (typescript 7)', () => {
            const file = writePackageJson({ bin: { tsc: 'bin/tsc' } });

            expect(resolveTscBin(file)).toBe(path.join(tmpDir, 'bin', 'tsc'));
        });

        it('should support bin declared as a string', () => {
            const file = writePackageJson({ bin: './bin/tsc' });

            expect(resolveTscBin(file)).toBe(path.join(tmpDir, 'bin', 'tsc'));
        });
    });

    describe('getTscWatchCommand', () => {
        it('should point to a runnable tsc of the installed typescript', () => {
            const [tscBin] = getTscWatchCommand('tsconfig.json');

            const { status, stdout } = spawnSync(process.execPath, [tscBin, '--version'], {
                encoding: 'utf8',
            });

            expect(status).toBe(0);
            expect(stdout).toMatch(/^Version \d+\.\d+/);
        });

        it('should watch the project without emitting files and skip lib check', () => {
            expect(getTscWatchCommand('/app/tsconfig.json').slice(1)).toEqual([
                '--watch',
                '--noEmit',
                '--project',
                '/app/tsconfig.json',
                '--skipLibCheck',
            ]);
        });
    });
});
