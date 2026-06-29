/* eslint-disable no-console */

import chalk from 'chalk';
import { Command, Option } from 'commander';

import { type CliFlags } from './defaults';
import { runInit } from './run';
import { type CodeLoader, type TestRunner } from './types';

// eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
const { version } = require('../package.json');

async function main(): Promise<void> {
    const program = new Command('create-arui-scripts-app');

    program
        .description('Создает шаблонный проект arui-scripts (интерактивный мастер)')
        .argument('[dir]', 'Директория проекта (по умолчанию — текущая)')
        .version(version, '-v, --version', 'Показать версию')
        .option('-y, --yes', 'Без вопросов, значения по умолчанию')
        .option('--force', 'Перезаписать существующие файлы шаблона')
        .option('--name <name>', 'Имя проекта (npm package name)')
        .option('--rtk', 'React + Redux Toolkit (или --no-rtk)')
        .addOption(new Option('--client-only', 'Только клиент').conflicts('ssr'))
        .addOption(new Option('--ssr', 'Клиент + сервер').conflicts('clientOnly'))
        .addOption(
            new Option('--code-loader <loader>', 'Транспилятор').choices(['swc', 'babel', 'tsc']),
        )
        .addOption(
            new Option('--test-runner <runner>', 'Тест-раннер').choices(['jest', 'vitest']),
        )
        .option('--css-modules', 'CSS-модули в примере (или --no-css-modules)')
        .option('--client-port <port>', 'Порт dev-сервера', (value) => Number(value))
        .option('--server-port <port>', 'Порт node-сервера', (value) => Number(value))
        .option('--docker-registry <registry>', 'Docker registry')
        .option('--presets <package>', 'Preset-пакет')
        .option('--polyfills', 'Добавить core-js (или --no-polyfills)')
        .option('--react-compiler', 'experimentalReactCompiler (или --no-react-compiler)')
        .option('--install', 'Установить зависимости (или --no-install)')
        .showHelpAfterError('(используйте --help для справки)')
        .action(async (dir: string | undefined, opts: Record<string, unknown>) => {
            await runInit({ targetDirArg: dir, flags: mapOptsToFlags(opts) });
        });

    await program.parseAsync(process.argv);
}

function mapOptsToFlags(opts: Record<string, unknown>): CliFlags {
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
    if (typeof opts.install === 'boolean') {
        flags.install = opts.install;
    }

    return flags;
}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`${chalk.red('✖')} ${message}`);
    process.exit(1);
});
