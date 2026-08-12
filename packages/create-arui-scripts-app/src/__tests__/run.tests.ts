import os from 'os';
import path from 'path';

import fs from 'fs-extra';
import prompts from 'prompts';

import { resolveCdPath, runInit } from '../run';

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
        expect(await fs.pathExists(path.join(target, '.yarn/releases/yarn-4.9.1.cjs'))).toBe(true);
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

    it('падает при существующей папке .yarn без --force', async () => {
        const target = path.join(tempDir, 'app');

        await fs.ensureDir(path.join(target, '.yarn'));

        await expect(
            runInit({
                cwd: tempDir,
                targetDirArg: 'app',
                flags: { yes: true },
            }),
        ).rejects.toThrow(/\.yarn/);
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

    describe('частичные флаги (prefill)', () => {
        const originalIsTTY = process.stdin.isTTY;

        afterEach(() => {
            Object.defineProperty(process.stdin, 'isTTY', {
                value: originalIsTTY,
                configurable: true,
            });
        });

        it('при TTY задает только вопросы без флагов и накладывает ответы поверх флагов', async () => {
            Object.defineProperty(process.stdin, 'isTTY', { value: true, configurable: true });

            // name и clientOnly заданы флагами — их вопросы (и serverPort) пропускаются.
            prompts.inject([
                false, // useRtk
                'babel', // codeLoader
                'vitest', // testRunner
                'none', // e2eFramework
                true, // cssModules
                8081, // clientServerPort
                '', // dockerRegistry
                '', // presets
                false, // polyfills
                false, // reactCompiler
                false, // useLint
                false, // install
            ]);

            await runInit({
                cwd: tempDir,
                targetDirArg: 'app',
                flags: { name: 'flagged-app', clientOnly: true },
                aruiScriptsVersion: '23.0.1',
            });

            const target = path.join(tempDir, 'app');
            const pkg = await fs.readJson(path.join(target, 'package.json'));

            expect(pkg.name).toBe('flagged-app');
            expect(pkg.scripts.test).toBe('arui-scripts test:vitest');
            expect(await fs.pathExists(path.join(target, 'src/index.tsx'))).toBe(true);
            expect(await fs.pathExists(path.join(target, 'src/server'))).toBe(false);

            const config = await fs.readFile(path.join(target, 'arui-scripts.config.ts'), 'utf8');

            expect(config).toContain('clientOnly: true');
            expect(config).toContain("codeLoader: 'babel'");
            expect(config).toContain('clientServerPort: 8081');
        });

        it('без TTY явные флаги дополняются дефолтами (CI-режим)', async () => {
            Object.defineProperty(process.stdin, 'isTTY', {
                value: undefined,
                configurable: true,
            });

            await runInit({
                cwd: tempDir,
                targetDirArg: 'app',
                flags: { testRunner: 'vitest' },
                aruiScriptsVersion: '23.0.1',
            });

            const pkg = await fs.readJson(path.join(tempDir, 'app', 'package.json'));

            expect(pkg.name).toBe('app');
            expect(pkg.scripts.test).toBe('arui-scripts test:vitest');
        });
    });
});

describe('resolveCdPath', () => {
    it('возвращает null, когда цель совпадает с текущей директорией', () => {
        expect(resolveCdPath('/a/b', '/a/b')).toBeNull();
    });

    it('возвращает относительный путь для вложенной директории', () => {
        expect(resolveCdPath('/a/b', '/a/b/app')).toBe('app');
        expect(resolveCdPath('/a/b', '/a/b/nested/app')).toBe(path.join('nested', 'app'));
    });

    it('возвращает абсолютный путь, когда цель вне текущей директории', () => {
        expect(resolveCdPath('/a/b/deep/cwd', '/tmp/target')).toBe('/tmp/target');
        expect(resolveCdPath('/a/b', '/a/sibling')).toBe('/a/sibling');
    });
});
