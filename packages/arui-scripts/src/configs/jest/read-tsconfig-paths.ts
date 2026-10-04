import fs from 'fs';

import { parse } from 'jsonc-parser';

/**
 * Читает `compilerOptions.paths` из tsconfig. Файл разбирается как JSONC: комментарии и висячие запятые допустимы,
 * как и в самом tsc. JS API TypeScript не используется: в TypeScript 7 его нет. Поле `extends` не разворачивается.
 */
export function readTsconfigPaths(tsconfigPath?: string | null): Record<string, string[]> {
    if (!tsconfigPath) {
        return {};
    }

    const tsconfig = parse(fs.readFileSync(tsconfigPath, 'utf8'), [], { allowTrailingComma: true });

    return tsconfig?.compilerOptions?.paths ?? {};
}
