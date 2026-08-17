import path from 'path';

import { exec, shellQuote } from '@alfalab/arui-scripts-artifacts';

/**
 * Конфиг едет вместе с arui-scripts — см. `artifacts-config.ts`. `require.resolve` дает абсолютный
 * путь до собранного файла и не выполняет его: конфиг исполнит уже CLI, в процессе сборки.
 */
const ARTIFACTS_CONFIG_PATH = require.resolve('./artifacts-config');

/**
 * Абсолютный путь до бинарника CLI @alfalab/arui-scripts-artifacts.
 *
 * Резолвим через package.json пакета, а не полагаемся на `node_modules/.bin` в PATH: команды
 * arui-scripts запускают не только из yarn-скриптов.
 */
function getArtifactsCliPath(): string {
    const packageJsonPath = require.resolve('@alfalab/arui-scripts-artifacts/package.json');
    // eslint-disable-next-line global-require, import/no-dynamic-require, @typescript-eslint/no-var-requires
    const { bin } = require(packageJsonPath);

    return path.join(
        path.dirname(packageJsonPath),
        typeof bin === 'string' ? bin : bin['arui-scripts-artifacts'],
    );
}

/**
 * Запускает команду CLI @alfalab/arui-scripts-artifacts с конфигом arui-scripts.
 *
 * Позиционные аргументы (`name=...`, `version=...`, `registry=...`) прокидываются как есть — их
 * разбирает сам CLI.
 */
export async function runArtifactsCli(command: string): Promise<void> {
    const args = process.argv.slice(3);
    const cliCommand = [
        shellQuote(process.execPath),
        shellQuote(getArtifactsCliPath()),
        command,
        '-c',
        shellQuote(ARTIFACTS_CONFIG_PATH),
        ...args,
    ].join(' ');

    try {
        await exec(cliCommand);
    } catch {
        // CLI уже напечатал ошибку (и стек, если включен debug)
        process.exit(1);
    }
}
