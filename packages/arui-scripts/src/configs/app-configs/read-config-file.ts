import path from 'path';

import { tryResolve } from '../util/resolve';

export function readConfigFile(cwd: string) {
    const appConfigPath = tryResolve(path.join(cwd, '/arui-scripts.config'));

    if (appConfigPath) {
        // Мы не можем использовать импорты, нам нужен именно require, потому что мы не знаем заранее не только путь до файла,
        // но и то, на каком языке он написан
        // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
        let appSettings = require(appConfigPath);

        // ts-node импортирует esModules, из них надо вытягивать default именно так
        // eslint-disable-next-line no-underscore-dangle
        if (appSettings.__esModule) {
            appSettings = appSettings.default;
        }

        return appSettings;
    }

    return null;
}
