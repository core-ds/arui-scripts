import { Command, Option } from 'commander';

import { type CliFlags } from './defaults';
import { runInit } from './run';
import { type CodeLoader, type E2eFramework, type TestRunner } from './types';

// eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
const { version } = require('../package.json');

export type InitHandler = (dir: string | undefined, flags: CliFlags) => Promise<void>;

const defaultInitHandler: InitHandler = (dir, flags) => runInit({ targetDirArg: dir, flags });

export function createProgram(onInit: InitHandler = defaultInitHandler): Command {
    const program = new Command('create-arui-scripts-app');

    program
        .description('Создает шаблонный проект arui-scripts')
        .argument('[dir]', 'Директория проекта (по умолчанию - текущая)')
        .version(version, '-v, --version', 'Показать версию')
        .option('-y, --yes', 'Без вопросов, значения по умолчанию')
        .option('--force', 'Перезаписать существующие файлы шаблона')
        .option('--name <name>', 'Имя проекта (npm package name)')
        .option('--rtk', 'React + Redux Toolkit')
        .option('--no-rtk', 'Только React, без RTK')
        .addOption(new Option('--client-only', 'Только клиент').conflicts('ssr'))
        .addOption(new Option('--ssr', 'Клиент + сервер').conflicts('clientOnly'))
        .addOption(
            new Option('--code-loader <loader>', 'Транспилятор').choices(['swc', 'babel', 'tsc']),
        )
        .addOption(new Option('--test-runner <runner>', 'Тест-раннер').choices(['jest', 'vitest']))
        .addOption(
            new Option('--e2e-framework <framework>', 'e2e фреймворк').choices([
                'cypress',
                'playwright',
                'none',
            ]),
        )
        .option('--router', 'Подключить React Router')
        .option('--no-router', 'Без React Router')
        .option('--css-modules', 'CSS-модули')
        .option('--no-css-modules', 'Обычный css')
        .option('--client-port <port>', 'Порт dev-сервера', (value) => Number(value))
        .option('--server-port <port>', 'Порт node-сервера', (value) => Number(value))
        .option('--docker-registry <registry>', 'Docker registry')
        .option('--presets <package>', 'Preset-пакет')
        .option('--polyfills', 'Добавить core-js')
        .option('--no-polyfills', 'Без полифилов')
        .option('--react-compiler', 'Включить experimentalReactCompiler')
        .option('--no-react-compiler', 'Выключить experimentalReactCompiler')
        .option('--lint', 'Подключить arui-presets-lint')
        .option('--no-lint', 'Без arui-presets-lint')
        .option('--install', 'Установить зависимости после генерации')
        .option('--no-install', 'Не устанавливать зависимости')
        .showHelpAfterError('(используйте --help для справки)')
        .action(async (dir: string | undefined, opts: Record<string, unknown>) => {
            await onInit(dir, mapOptsToFlags(opts));
        });

    return program;
}

export function mapOptsToFlags(opts: Record<string, unknown>): CliFlags {
    const flags: CliFlags = {};

    if (opts.yes === true) {
        flags.yes = true;
    }

    if (opts.force === true) {
        flags.force = true;
    }

    if (typeof opts.name === 'string') {
        flags.name = opts.name;
    }

    if (typeof opts.rtk === 'boolean') {
        flags.useRtk = opts.rtk;
    }

    if (opts.clientOnly === true) {
        flags.clientOnly = true;
    }

    if (opts.ssr === true) {
        flags.clientOnly = false;
    }

    if (typeof opts.codeLoader === 'string') {
        flags.codeLoader = opts.codeLoader as CodeLoader;
    }

    if (typeof opts.testRunner === 'string') {
        flags.testRunner = opts.testRunner as TestRunner;
    }

    if (typeof opts.e2eFramework === 'string') {
        flags.e2eFramework = opts.e2eFramework as E2eFramework;
    }

    if (typeof opts.cssModules === 'boolean') {
        flags.cssModules = opts.cssModules;
    }

    if (typeof opts.clientPort === 'number' && !Number.isNaN(opts.clientPort)) {
        flags.clientServerPort = opts.clientPort;
    }

    if (typeof opts.serverPort === 'number' && !Number.isNaN(opts.serverPort)) {
        flags.serverPort = opts.serverPort;
    }

    if (typeof opts.dockerRegistry === 'string') {
        flags.dockerRegistry = opts.dockerRegistry;
    }
    if (typeof opts.presets === 'string') {
        flags.presets = opts.presets;
    }

    if (typeof opts.polyfills === 'boolean') {
        flags.polyfills = opts.polyfills;
    }

    if (typeof opts.reactCompiler === 'boolean') {
        flags.reactCompiler = opts.reactCompiler;
    }

    if (typeof opts.router === 'boolean') {
        flags.useRouter = opts.router;
    }

    if (typeof opts.lint === 'boolean') {
        flags.useLint = opts.lint;
    }

    if (typeof opts.install === 'boolean') {
        flags.install = opts.install;
    }

    return flags;
}
