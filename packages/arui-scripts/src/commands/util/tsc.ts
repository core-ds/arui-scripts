import fs from 'fs';
import path from 'path';

/**
 * Путь до исполняемого файла tsc из поля `bin` пакета typescript. Использовать `typescript/lib/tsc.js` нельзя:
 * в TypeScript 7 этого файла нет в `exports`, а `package.json` и поле `bin` есть во всех версиях.
 */
export function resolveTscBin(
    typescriptPackageJsonPath = require.resolve('typescript/package.json'),
) {
    const { bin } = JSON.parse(fs.readFileSync(typescriptPackageJsonPath, 'utf8')) as {
        bin: string | Record<string, string>;
    };

    return path.resolve(
        path.dirname(typescriptPackageJsonPath),
        typeof bin === 'string' ? bin : bin.tsc,
    );
}

export function getTscWatchCommand(tsconfig: string) {
    return [resolveTscBin(), '--watch', '--noEmit', '--project', tsconfig, '--skipLibCheck'];
}
