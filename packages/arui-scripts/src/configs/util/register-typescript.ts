import fs from 'fs';

import { transformSync } from '@swc/core';

type CompilableModule = NodeJS.Module & { _compile: (code: string, filename: string) => void };

/**
 * Транспилирует TypeScript в CommonJS. Типы не проверяются, tsconfig и .swcrc приложения не читаются:
 * файлы конфигурации должны загружаться одинаково при любых настройках проекта.
 */
export function compileTypescript(source: string, filename: string) {
    return transformSync(source, {
        filename,
        swcrc: false,
        configFile: false,
        jsc: {
            parser: { syntax: 'typescript', tsx: filename.endsWith('.tsx') },
            target: 'es2022',
        },
        module: { type: 'commonjs' },
    }).code;
}

function loadTypescript(module: NodeJS.Module, filename: string) {
    const code = compileTypescript(fs.readFileSync(filename, 'utf8'), filename);

    // eslint-disable-next-line no-underscore-dangle
    (module as CompilableModule)._compile(code, filename);
}

/**
 * Позволяет `require`-ить файлы `.ts` и `.tsx`. Конфиги, оверрайды и пресеты приложения могут быть написаны
 * на TypeScript, и заранее неизвестно, на каком именно языке, поэтому все они загружаются обычным `require`.
 */
export function registerTypescript(extensions: NodeJS.RequireExtensions = require.extensions) {
    Object.assign(extensions, { '.ts': loadTypescript, '.tsx': loadTypescript });
}
