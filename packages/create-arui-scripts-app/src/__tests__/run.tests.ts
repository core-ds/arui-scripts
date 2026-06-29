import fs from 'fs-extra';
import os from 'os';
import path from 'path';

import { runInit } from '../run';

describe('runInit', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'create-arui-'));
    });

    afterEach(async () => {
        await fs.remove(tempDir);
    });

    it('с --yes создает проект без промптов', async () => {
        const target = path.join(tempDir, 'app');

        await runInit({
            cwd: tempDir,
            targetDirArg: 'app',
            flags: { yes: true },
            aruiScriptsVersion: '23.0.1',
        });

        const pkg = await fs.readJson(path.join(target, 'package.json'));

        expect(pkg.name).toBe('app');
        expect(pkg.devDependencies['arui-scripts']).toBe('^23.0.1');
        expect(await fs.pathExists(path.join(target, 'src/client/index.tsx'))).toBe(true);
    });

    it('падает при конфликте файлов без --force', async () => {
        const target = path.join(tempDir, 'app');

        await fs.ensureDir(target);
        await fs.writeFile(path.join(target, 'package.json'), '{}');

        await expect(
            runInit({
                cwd: tempDir,
                targetDirArg: 'app',
                flags: { yes: true },
            }),
        ).rejects.toThrow(/package\.json/);
    });

    it('с --force перезаписывает конфликтующие файлы', async () => {
        const target = path.join(tempDir, 'app');

        await fs.ensureDir(target);
        await fs.writeFile(path.join(target, 'package.json'), '{"name":"old"}');

        await runInit({
            cwd: tempDir,
            targetDirArg: 'app',
            flags: { yes: true, force: true, name: 'fresh-app' },
            aruiScriptsVersion: '1.2.3',
        });

        const pkg = await fs.readJson(path.join(target, 'package.json'));

        expect(pkg.name).toBe('fresh-app');
    });

    it('отклоняет невалидное имя', async () => {
        await expect(
            runInit({
                cwd: tempDir,
                targetDirArg: 'app',
                flags: { yes: true, name: 'Bad Name' },
            }),
        ).rejects.toThrow(/URL-friendly|capital letters/i);
    });
});
