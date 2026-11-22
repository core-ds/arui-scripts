import fs from 'fs';
import path from 'path';

import { gte, valid } from 'semver';
import type * as TypeScript from 'typescript';

import { type AppContextWithConfigs } from '../../../configs/app-configs/types';

import { generateModuleDeclarations } from './generate-declarations';
import { formatDiagnostics, requireProjectTypeScript } from './project-typescript';

/** Каталог пакета контрактов внутри buildPath: вне публичной статики, очищается каждой сборкой. */
export const MODULE_CONTRACTS_DIRECTORY = 'module-contracts';

/** Готовит npm-пакет контрактов; при ошибке генерации или проверки не оставляет файлов. */
export function buildModuleContracts(config: AppContextWithConfigs) {
    if (!config.modules?.types) return undefined;
    const { types: settings, exposes } = config.modules;
    const version = valid(settings.version ?? config.version);

    if (!version) {
        throw new Error(
            'modules.types: укажите SemVer-версию в modules.types.version или в package.json приложения.',
        );
    }
    const directory = path.join(config.serverOutputPath, MODULE_CONTRACTS_DIRECTORY);

    // Пакет прошлого запуска не должен пережить неудачную генерацию.
    fs.rmSync(directory, { recursive: true, force: true });
    const ts = requireProjectTypeScript(config.cwd);
    const { files, peerDependencies } = generateModuleDeclarations({
        ts,
        cwd: config.cwd,
        tsconfig: config.tsconfig as string,
        exposes: exposes as Record<string, string>,
    });

    files.set(
        'package.json',
        `${JSON.stringify(
            {
                name: settings.packageName,
                version,
                type: 'module',
                types: './index.d.ts',
                exports: {
                    '.': {
                        import: { types: './index.d.ts' },
                        require: { types: './index.d.cts' },
                    },
                },
                files: ['**/*.d.ts', '**/*.d.mts', '**/*.d.cts'],
                peerDependencies: Object.fromEntries(
                    Object.entries(peerDependencies).sort(([a], [b]) => a.localeCompare(b)),
                ),
            },
            null,
            2,
        )}\n`,
    );

    try {
        files.forEach((text, filename) => {
            const target = path.join(directory, filename);

            fs.mkdirSync(path.dirname(target), { recursive: true });
            fs.writeFileSync(target, text);
        });
        validateDeclarations(ts, config.cwd, directory);
    } catch (error) {
        fs.rmSync(directory, { recursive: true, force: true });
        throw error;
    }

    console.log(`Module contracts: ${settings.packageName}@${version} → ${directory}`);

    return directory;
}

/** Проверяет декларации без настроек TypeScript из проекта микрофронта. */
function validateDeclarations(ts: typeof TypeScript, cwd: string, directory: string) {
    const entrypoints = ['index.d.ts'];

    // `resolution-mode` в `export type ... with` из index.d.cts поддерживается с TypeScript 5.3.
    if (gte(ts.version, '5.3.0')) entrypoints.push('index.d.cts');
    const program = ts.createProgram(
        entrypoints.map((file) => path.join(directory, file)),
        {
            noEmit: true,
            strict: true,
            skipLibCheck: false,
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.NodeNext,
            moduleResolution: ts.ModuleResolutionKind.NodeNext,
            types: [],
            lib: ['lib.esnext.d.ts', 'lib.dom.d.ts'],
        },
    );
    const diagnostics = ts.getPreEmitDiagnostics(program);

    if (diagnostics.length) {
        throw new Error(
            `modules.types: декларации не проходят проверку без настроек проекта микрофронта.\n${formatDiagnostics(
                ts,
                cwd,
                diagnostics,
            )}`,
        );
    }
}
