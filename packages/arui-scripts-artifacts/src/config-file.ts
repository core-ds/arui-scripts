import { type BuildArtifactOptions } from './build-artifact';
import { type ArtifactsOptions } from './types';

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
     * Встроенные `docker-build` и `docker-build:compiled` можно донасыщать или переопределять.
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
        variant: 'runtime',
        allowLocalDockerfile: true,
        allowLocalStartScript: true,
        addNodeModulesToDockerIgnore: false,
    },
    'docker-build:compiled': {
        artifact: 'docker',
        variant: 'compiled',
        allowLocalDockerfile: false,
        allowLocalStartScript: false,
        addNodeModulesToDockerIgnore: true,
    },
    'archive-build': {
        artifact: 'archive',
    },
};

/** Ключи, которые надо сливать по полям, а не заменять целиком. */
const SHALLOW_MERGED_KEYS = [
    'nginx',
    'localFiles',
    'templates',
    'overrides',
    'extraBuildArgs',
] as const;

function mergeOptions(base: ArtifactsOptions, patch: ArtifactsOptions): ArtifactsOptions {
    const result: ArtifactsOptions = { ...base, ...patch };

    SHALLOW_MERGED_KEYS.forEach((key) => {
        const baseValue = base[key];
        const patchValue = patch[key];

        // `nginx: false` — осмысленное значение «не генерировать базовый конфиг», не сливаем
        if (
            baseValue &&
            patchValue &&
            typeof baseValue === 'object' &&
            typeof patchValue === 'object'
        ) {
            Object.assign(result, { [key]: { ...baseValue, ...patchValue } });
        }
    });

    return result;
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
