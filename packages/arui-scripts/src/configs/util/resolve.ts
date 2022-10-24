import path from 'path';

export function tryResolve(...args: Parameters<typeof require.resolve>) {
    try {
        return require.resolve(...args);
    } catch (e) {
        return undefined;
    }
}

/**
 * Возвращает полный путь до модуля из node_modules относительно базового пути.
 * Может быть полезно для определения пути до модуля, когда в проекте установлено сразу несколько модулей.
 * /project
 * --/node_modules
 * ----/module1 // через эту функцию мы получим этот модуль
 * ----/arui-scripts
 * ------/node_modules
 * --------/module1 // через require.resolve мы получим этот модуль
 */
export function resolveNodeModuleRelativeTo(basePath: string, moduleName: string) {
    return path.resolve(basePath, `node_modules/${moduleName}`);
}
