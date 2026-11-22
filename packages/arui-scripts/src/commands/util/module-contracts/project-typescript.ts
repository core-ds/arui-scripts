import { createRequire } from 'module';
import path from 'path';

import type * as TypeScript from 'typescript';

import { getProjectTypeScript } from '../../../configs/util/typescript';

/** Загружает Compiler API из TypeScript проекта; генерации нужен TypeScript 5.x или 6.x. */
export function requireProjectTypeScript(cwd: string) {
    const { version } = getProjectTypeScript(cwd);

    if (![5, 6].includes(Number.parseInt(version, 10))) {
        throw new Error('modules.types: генерация требует TypeScript 5.x или 6.x с Compiler API.');
    }

    return createRequire(path.join(cwd, 'package.json'))('typescript') as typeof TypeScript;
}

export function formatDiagnostics(
    ts: typeof TypeScript,
    cwd: string,
    diagnostics: readonly TypeScript.Diagnostic[],
) {
    return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (file) => file,
        getCurrentDirectory: () => cwd,
        getNewLine: () => '\n',
    });
}
