import path from 'path';

import type * as TypeScript from 'typescript';

import { slash } from './declaration-paths';
import { type EmittedDeclaration } from './emit-declarations';

export function createDeclarationReferences(
    ts: typeof TypeScript,
    producer: TypeScript.Program,
    declarations: ReadonlyMap<string, EmittedDeclaration>,
) {
    const bySource = new Map(
        Array.from(declarations, ([filename, declaration]) => [
            declaration.source,
            { filename, ...declaration },
        ]),
    );

    if (
        !producer
            .getSourceFiles()
            .some((file) => file.isDeclarationFile && bySource.has(file.fileName))
    ) {
        return () => new Set<string>();
    }

    const options = producer.getCompilerOptions();
    const host = ts.createCompilerHost(options, true);
    const { getSourceFile } = host;

    // Bind the emitted signatures at their original paths, so type references can find
    // ambient symbols without including every declaration from the producer's tsconfig.
    host.getSourceFile = (filename, languageVersion, onError, shouldCreateNewSourceFile) => {
        const emitted = bySource.get(filename);

        return emitted
            ? ts.createSourceFile(filename, emitted.text, languageVersion, true, ts.ScriptKind.TS)
            : getSourceFile(filename, languageVersion, onError, shouldCreateNewSourceFile);
    };
    const program = ts.createProgram([...producer.getRootFileNames()], options, host);
    const checker = program.getTypeChecker();

    return (source: TypeScript.SourceFile) => {
        const boundSource = program.getSourceFile(source.fileName);
        const references = new Set<string>();
        const visit = (node: TypeScript.Node) => {
            if (ts.isIdentifier(node) || ts.isStringLiteral(node)) {
                checker.getSymbolAtLocation(node)?.declarations?.forEach((declaration) => {
                    const owner = declaration.getSourceFile();
                    const emitted = bySource.get(owner.fileName);

                    if (owner.isDeclarationFile && owner !== boundSource && emitted) {
                        references.add(emitted.filename);
                    }
                });
            }
            ts.forEachChild(node, visit);
        };

        if (boundSource) visit(boundSource);

        return references;
    };
}

/** Заменяет пути `/// <reference path>` по позициям из парсера, не трогая остальной текст. */
export function rewriteReferencePaths(
    ts: typeof TypeScript,
    text: string,
    rewrite: (fileName: string) => string,
) {
    const { referencedFiles } = ts.createSourceFile(
        'references.d.ts',
        text,
        ts.ScriptTarget.Latest,
    );

    return [...referencedFiles]
        .sort((a, b) => b.pos - a.pos)
        .reduce(
            (result, { pos, end, fileName }) =>
                `${result.slice(0, pos)}${rewrite(fileName)}${result.slice(end)}`,
            text,
        );
}

export function referencePaths(from: string, targets: Iterable<string>) {
    return Array.from(
        targets,
        (target) =>
            `/// <reference path=${JSON.stringify(
                slash(path.relative(path.dirname(from), target)),
            )} />\n`,
    ).join('');
}
