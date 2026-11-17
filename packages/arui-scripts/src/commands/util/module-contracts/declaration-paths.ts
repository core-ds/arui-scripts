import path from 'path';

import type * as TypeScript from 'typescript';

export const slash = (value: string) => value.split(path.sep).join('/');

function declarationPath(source: string, cwd: string, suffix: string) {
    const relative = path.relative(cwd, source);

    if (relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
        throw new Error(`Контракт ссылается на файл за пределами проекта: ${source}`);
    }

    if (relative.endsWith('.json')) {
        return `declarations/${slash(relative)}.d.cts`;
    }

    if (relative.endsWith('.d.ts')) {
        return `declarations/${slash(relative.slice(0, -5))}${suffix}`;
    }

    return `declarations/${slash(relative).replace(
        /(?<!\.d)\.(tsx?|mts|cts|jsx?|mjs|cjs)$/,
        (_, ext) => {
            if (ext === 'mts' || ext === 'mjs') return '.d.mts';
            if (ext === 'cts' || ext === 'cjs') return '.d.cts';

            return suffix;
        },
    )}`;
}

export function createDeclarationPath(
    ts: typeof TypeScript,
    program: TypeScript.Program,
    cwd: string,
) {
    const { module } = program.getCompilerOptions();
    const nodeFormat =
        module !== undefined &&
        [
            ts.ModuleKind.Node16,
            ts.ModuleKind.Node18,
            ts.ModuleKind.Node20,
            ts.ModuleKind.NodeNext,
        ].includes(module);

    return (filename: string) => {
        let format = nodeFormat ? program.getSourceFile(filename)?.impliedNodeFormat : undefined;

        if (module === ts.ModuleKind.CommonJS) {
            format = module;
        }

        let suffix = '.d.ts';

        if (format === ts.ModuleKind.CommonJS) {
            suffix = '.d.cts';
        }

        if (format === ts.ModuleKind.ESNext) {
            suffix = '.d.mts';
        }

        return declarationPath(filename, cwd, suffix);
    };
}

export function importPath(from: string, to: string) {
    const relative = slash(path.relative(path.dirname(from), to))
        .replace(/\.d\.mts$/, '.mjs')
        .replace(/\.d\.cts$/, '.cjs')
        .replace(/\.d\.ts$/, '.js');

    return relative.startsWith('.') ? relative : `./${relative}`;
}
