import path from 'path';

import fs from 'fs-extra';
import { createJiti } from 'jiti';

import { type ArtifactsConfigFile, type ArtifactsConfigFileExport } from './config-file';

/** Имена, по которым конфиг ищется автоматически, если не передан `--config`. */
export const CONFIG_FILE_NAMES = [
    'arui-scripts-artifacts.ts',
    'arui-scripts-artifacts.mts',
    'arui-scripts-artifacts.cts',
    'arui-scripts-artifacts.js',
    'arui-scripts-artifacts.mjs',
    'arui-scripts-artifacts.cjs',
    'arui-scripts-artifacts.config.ts',
    'arui-scripts-artifacts.config.js',
];

/**
 * Ищет конфиг в `cwd`. Явно переданный путь имеет приоритет и обязан существовать — молча
 * игнорировать опечатку в `--config` хуже, чем упасть.
 */
export function findConfigFile(cwd: string, explicitPath?: string): string | null {
    if (explicitPath) {
        const configPath = path.resolve(cwd, explicitPath);

        if (!fs.existsSync(configPath)) {
            throw new Error(`Config file not found: ${configPath}`);
        }

        return configPath;
    }

    return (
        CONFIG_FILE_NAMES.map((fileName) => path.join(cwd, fileName)).find((filePath) =>
            fs.existsSync(filePath),
        ) ?? null
    );
}

/**
 * Загружает конфиг. Через jiti, поэтому одинаково работают TypeScript, ESM и CommonJS без
 * дополнительных загрузчиков в проекте.
 */
export async function loadConfigFile(configPath: string): Promise<ArtifactsConfigFile> {
    const jiti = createJiti(__filename, { interopDefault: true });

    const configModule = await jiti.import<ArtifactsConfigFileExport>(configPath, {
        default: true,
    });

    const config = typeof configModule === 'function' ? await configModule() : configModule;

    if (!config || typeof config !== 'object') {
        throw new Error(
            `Config file ${configPath} must export an object or a function returning an object`,
        );
    }

    return config;
}

/** Находит и загружает конфиг проекта. Если конфига нет — пустой объект. */
export async function resolveConfigFile(
    cwd: string,
    explicitPath?: string,
): Promise<ArtifactsConfigFile> {
    const configPath = findConfigFile(cwd, explicitPath);

    if (!configPath) {
        return {};
    }

    return loadConfigFile(configPath);
}
