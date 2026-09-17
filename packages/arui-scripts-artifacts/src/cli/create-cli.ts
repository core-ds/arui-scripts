import { Command } from 'commander';

import { type ArtifactsConfigFile, BUILT_IN_COMMANDS, getAvailableCommands } from './config-file';

/** Описания встроенных команд для `--help`. */
const BUILT_IN_DESCRIPTIONS: Record<string, string> = {
    'docker-build': 'Сборка приложения на хосте, создание docker образа и пуш в registry',
    'docker-build:compiled':
        'Как docker-build, но зависимости и сборка выполняются внутри образа (для CI/CD)',
    'archive-build':
        'Собирает tar-архив с production-сборкой (buildPath, node_modules, package.json, config)',
};

const CONFIG_OPTION_HELP =
    'Путь до конфига (по умолчанию arui-scripts-artifacts.ts в корне проекта)';

/**
 * Добавляет опцию конфига. Кроме канонических `-c`/`--config` принимаем и `--c` — commander не умеет
 * несколько длинных имен у одной опции, поэтому вторая объявлена отдельно и скрыта из справки.
 */
function addConfigOption(command: Command): Command {
    return command
        .option('-c, --config <path>', CONFIG_OPTION_HELP)
        .addOption(new Command().createOption('--c <path>', CONFIG_OPTION_HELP).hideHelp());
}

/** Значение опции конфига, из какого бы из ее написаний оно ни пришло. */
function getConfigPath(options: { config?: string; c?: string }): string | undefined {
    return options.config ?? options.c;
}

/**
 * Достает путь до конфига до того, как построен основной CLI: список команд зависит от конфига,
 * а конфиг — от аргументов. Разбирает тем же commander, просто с выключенными проверками.
 */
export function extractConfigPath(argv: string[]): string | undefined {
    const program = addConfigOption(new Command())
        .allowUnknownOption()
        .allowExcessArguments()
        .helpOption(false);

    program.parse(argv, { from: 'user' });

    return getConfigPath(program.opts());
}

export type RunCommandParams = {
    /** Имя команды из конфига или встроенной. */
    command: string;
    /** Позиционные аргументы команды (`name=... version=... registry=...`). */
    args: string[];
};

export type CreateCliParams = {
    /** Загруженный конфиг проекта — из него берется список доступных команд. */
    configFile: ArtifactsConfigFile;
    version: string;
    run: (params: RunCommandParams) => Promise<void> | void;
};

/**
 * Собирает CLI: по одной подкоманде на каждую доступную сборку — встроенные плюс объявленные в
 * `commands` конфига проекта. Благодаря этому `--help` показывает и кастомные команды, а опечатка в
 * имени дает подсказку вместо простого списка.
 */
export function createCli({ configFile, version, run }: CreateCliParams): Command {
    const program = new Command('arui-scripts-artifacts');

    program
        .description('Сборка docker-образов для приложений на arui-scripts')
        .version(version, '-v, --version', 'Показать версию')
        .showHelpAfterError('(используйте --help для списка команд)')
        .showSuggestionAfterError();

    addConfigOption(program);

    getAvailableCommands(configFile).forEach((name) => {
        const isBuiltIn = Boolean(BUILT_IN_COMMANDS[name]);
        const description = isBuiltIn
            ? BUILT_IN_DESCRIPTIONS[name]
            : 'Команда из arui-scripts-artifacts конфига проекта';

        const command = program
            .command(name)
            .description(description)
            // name=/version=/registry= — позиционные аргументы, а не опции commander
            .allowUnknownOption()
            .allowExcessArguments()
            .action(async () => {
                await run({ command: name, args: command.args });
            });

        addConfigOption(command);
    });

    program.addHelpText(
        'after',
        [
            '',
            'Имя образа формируется как {docker.registry}/{name}:{version}.',
            'name и version по умолчанию берутся из package.json, но их можно переопределить:',
            '  arui-scripts-artifacts docker-build name=container-name version=0.1-beta',
        ].join('\n'),
    );

    return program;
}
