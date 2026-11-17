import type * as TypeScript from 'typescript';

export type EmittedDeclaration = { source: string; text: string };

export function emitDeclarations(
    ts: typeof TypeScript,
    program: TypeScript.Program,
    declarationPath: (filename: string) => string,
) {
    const declarations = new Map<string, EmittedDeclaration>();
    const emitted = program.emit(undefined, (_file, text, _bom, _error, sources) => {
        const source = sources?.[0]?.fileName;

        if (source) declarations.set(declarationPath(source), { source, text });
    });
    const checker = program.getTypeChecker();

    program.getSourceFiles().forEach((source) => {
        if (source.fileName.endsWith('.json') && !program.isSourceFileFromExternalLibrary(source)) {
            const statement = source.statements[0];

            if (!statement || !ts.isExpressionStatement(statement)) {
                throw new Error(`modules.types: не удалось получить тип JSON ${source.fileName}`);
            }
            const type = checker.typeToTypeNode(
                checker.getTypeAtLocation(statement.expression),
                undefined,
                ts.NodeBuilderFlags.NoTruncation,
            );

            if (!type) throw new Error(`modules.types: отсутствует тип JSON ${source.fileName}`);
            const text = ts.createPrinter().printNode(ts.EmitHint.Unspecified, type, source);

            declarations.set(declarationPath(source.fileName), {
                source: source.fileName,
                text: `declare const value: ${text};\nexport = value;\n`,
            });
        } else if (
            source.isDeclarationFile &&
            !program.isSourceFileDefaultLibrary(source) &&
            !program.isSourceFileFromExternalLibrary(source)
        ) {
            declarations.set(declarationPath(source.fileName), {
                source: source.fileName,
                text: source.text,
            });
        }
    });

    // JSON may set emitSkipped even when all required TS declarations were emitted.
    // The caller checks diagnostics and requires every reachable declaration to exist.
    return { declarations, diagnostics: emitted.diagnostics };
}
