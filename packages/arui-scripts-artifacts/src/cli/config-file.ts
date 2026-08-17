import { type ArtifactsOptions } from '../config/types';
import { type BuildArtifactOptions } from '../pipeline/build-artifact';

/**
 * Содержимое `arui-scripts-artifacts.ts` — единственный источник правды для всех команд проекта.
 *
 * Верхний уровень описывает общие для проекта настройки, `commands` — конкретные сборки. Команда
 * наследует верхний уровень, поэтому «еще один образ с другим портом» — это несколько строк в
 * конфиге, а не отдельный скрипт.
 */
export type ArtifactsConfigFile = ArtifactsOptions & {
    /**
     * Именованные команды. Имя становится аргументом CLI: `arui-scripts-artifacts <имя>`.
     * Встроенные `docker-build`, `docker-build:compiled` и `archive-build` можно донасыщать или
     * переопределять.
     */
    commands?: Record<string, ArtifactsOptions>;
};

/** Конфиг может экспортировать объект или (в т.ч. асинхронную) функцию, возвращающую объект. */
export type ArtifactsConfigFileExport =
    | ArtifactsConfigFile
    | (() => ArtifactsConfigFile | Promise<ArtifactsConfigFile>);

/**
 * Хелпер для типизации `arui-scripts-artifacts.ts`. Ничего не делает в рантайме — существует только
 * ради автодополнения и проверки типов в конфиге.
 */
export function defineConfig(config: ArtifactsConfigFileExport): ArtifactsConfigFileExport {
    return config;
}

/**
 * Встроенные команды. Задают только то, что отличает одну команду от другой; все остальное берется
 * из конфига проекта.
 */
export const BUILT_IN_COMMANDS: Record<string, ArtifactsOptions> = {
    'docker-build': {
        artifact: 'docker',
        docker: { variant: 'runtime', addNodeModulesToDockerIgnore: false },
        localFiles: { allowDockerfile: true, allowStartScript: true },
    },
    'docker-build:compiled': {
        artifact: 'docker',
        docker: { variant: 'compiled', addNodeModulesToDockerIgnore: true },
        localFiles: { allowDockerfile: false, allowStartScript: false },
    },
    'archive-build': {
        artifact: 'archive',
    },
};

/** Секции конфига — их сливаем по полям, а не заменяем целиком. */
const MERGED_SECTIONS = [
    'docker',
    'nginx',
    'archive',
    'build',
    'packageManager',
    'localFiles',
    'templates',
    'overrides',
] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeSection(
    base: Record<string, unknown>,
    patch: Record<string, unknown>,
): Record<string, unknown> {
    const result = { ...base, ...patch };

    // единственная вложенная в секцию секция — `nginx.baseConf`, и ее тоже ожидаемо сливать по полям.
    // `baseConf: false/null` — осмысленное «не генерировать базовый конфиг», такое значение не сливаем
    Object.keys(patch).forEach((key) => {
        if (isPlainObject(base[key]) && isPlainObject(patch[key])) {
            result[key] = { ...base[key], ...patch[key] };
        }
    });

    return result;
}

function mergeOptions(base: ArtifactsOptions, patch: ArtifactsOptions): ArtifactsOptions {
    const result: ArtifactsOptions = { ...base, ...patch };

    MERGED_SECTIONS.forEach((key) => {
        const baseValue = base[key];
        const patchValue = patch[key];

        if (isPlainObject(baseValue) && isPlainObject(patchValue)) {
            Object.assign(result, { [key]: mergeSection(baseValue, patchValue) });
        }
    });

    return result;
}

/**
 * Сливает несколько конфигов в один: каждый следующий переопределяет предыдущие по тем же правилам,
 * что и команда переопределяет верхний уровень — секции по полям, `commands` по имени команды.
 *
 * Нужно тем, кто отдает CLI собственный конфиг (`-c`) и хочет доложить поверх пользовательский —
 * так делает arui-scripts, чтобы `arui-scripts-artifacts.ts` в корне проекта продолжал работать.
 */
export function mergeConfigFiles(...configFiles: ArtifactsConfigFile[]): ArtifactsConfigFile {
    return configFiles.reduce<ArtifactsConfigFile>((base, patch) => {
        const { commands: baseCommands, ...baseShared } = base;
        const { commands: patchCommands, ...patchShared } = patch;

        const merged: ArtifactsConfigFile = mergeOptions(baseShared, patchShared);
        const commandNames = [
            ...new Set([...Object.keys(baseCommands ?? {}), ...Object.keys(patchCommands ?? {})]),
        ];

        if (commandNames.length) {
            merged.commands = Object.fromEntries(
                commandNames.map((name) => [
                    name,
                    mergeOptions(baseCommands?.[name] ?? {}, patchCommands?.[name] ?? {}),
                ]),
            );
        }

        return merged;
    }, {});
}

/** Список команд, доступных с данным конфигом: встроенные плюс объявленные в проекте. */
export function getAvailableCommands(configFile: ArtifactsConfigFile = {}): string[] {
    return Array.from(
        new Set([...Object.keys(BUILT_IN_COMMANDS), ...Object.keys(configFile.commands ?? {})]),
    );
}

/**
 * Собирает опции конкретной команды. Приоритет (по возрастанию):
 * дефолты встроенной команды → верхний уровень конфига → секция `commands[command]`.
 *
 * Возвращает `null`, если такой команды нет ни среди встроенных, ни в конфиге.
 */
export function resolveCommandOptions(
    command: string,
    configFile: ArtifactsConfigFile = {},
): BuildArtifactOptions | null {
    const { commands, ...sharedOptions } = configFile;
    const builtIn = BUILT_IN_COMMANDS[command];
    const declared = commands?.[command];

    if (!builtIn && !declared) {
        return null;
    }

    let options = builtIn ?? {};

    options = mergeOptions(options, sharedOptions);

    if (declared) {
        options = mergeOptions(options, declared);
    }

    return options;
}
