import fs from 'fs';
import path from 'path';

import { tryResolve } from './resolve';

const DEVTOOLS_PACKAGE = '@alfalab/scripts-devtools';

/**
 * Путь до энтрипоинта панели отладки модулей.
 *
 * Резолвим не через `require.resolve('@alfalab/scripts-devtools/auto')`: node выбирает по условию
 * `require` commonjs-сборку, в которой динамический `import()` уже превратился в `require`.
 * Такой чанк rspack не выделит, и код панели целиком уедет в основной бандл вместо отдельного
 * файла, который грузится только при открытии. Поэтому идём от package.json и берём esm явно.
 *
 * @returns путь до файла или undefined, если пакет не установлен - собраться без панели
 * лучше, чем уронить сборку приложения
 */
export function getDevtoolsEntry(): string | undefined {
    const packageJsonPath = tryResolve(`${DEVTOOLS_PACKAGE}/package.json`);

    if (!packageJsonPath) {
        return undefined;
    }

    const entryPath = path.join(path.dirname(packageJsonPath), 'build', 'esm', 'auto.js');

    return fs.existsSync(entryPath) ? entryPath : undefined;
}
