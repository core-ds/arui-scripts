import path from 'path';

import type * as TypeScript from 'typescript';

import { packageForFile } from './contract-dependencies';
import { slash } from './declaration-paths';
import { type EmittedDeclaration } from './emit-declarations';

export type DeclarationReferences = {
    /** Ambient-декларации проекта, на символы которых ссылается файл. */
    declarations: Set<string>;
    /** Файлы импортируемых пакетов, чьи глобальные типы использует файл. */
    globalTypes: Set<string>;
};

/** Объявление в глобальной области: в скрипте или в `declare global`, но не в `declare module "x"`. */
function isGlobalDeclaration(ts: typeof TypeScript, declaration: TypeScript.Declaration) {
    for (let node = declaration.parent; node; node = node.parent) {
        if (ts.isModuleDeclaration(node)) {
            if (node.flags & ts.NodeFlags.GlobalAugmentation) return true;
            if (ts.isStringLiteral(node.name)) return false;
        }
    }

    return !ts.isExternalModule(declaration.getSourceFile());
}

/**
 * Пакеты, которые импортирует код проекта. Их глобальные типы (как JSX в `@types/react`)
 * приходят к хосту вместе с импортом. Пакеты только из `types` — окружение поставщика:
 * их глобалы не публикуются, и декларации с ними не проходят проверку.
 */
function getImportedPackages(
    ts: typeof TypeScript,
    program: TypeScript.Program,
    host: TypeScript.ModuleResolutionHost,
) {
    const options = program.getCompilerOptions();
    const names = new Set<string>();

    program
        .getSourceFiles()
        .filter(
            (file) =>
                !program.isSourceFileFromExternalLibrary(file) &&
                !program.isSourceFileDefaultLibrary(file),
        )
        .forEach((file) => {
            ts.preProcessFile(file.text, true, true).importedFiles.forEach(({ fileName }) => {
                const resolved = ts.resolveModuleName(
                    fileName,
                    file.fileName,
                    options,
                    host,
                ).resolvedModule;
                const owner =
                    resolved?.isExternalLibraryImport && packageForFile(resolved.resolvedFileName);

                if (owner) names.add(owner.name);
            });
        });

    return names;
}

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
    const producerFiles = producer
        .getSourceFiles()
        .filter((file) => !producer.isSourceFileDefaultLibrary(file));
    const externalFiles = new Set(
        producerFiles
            .filter((file) => producer.isSourceFileFromExternalLibrary(file))
            .map((file) => file.fileName),
    );
    const options = producer.getCompilerOptions();
    const host = ts.createCompilerHost(options, true);
    const { getSourceFile } = host;
    const importedPackages = getImportedPackages(ts, producer, host);
    const isImportedGlobal = (declaration: TypeScript.Declaration) => {
        const { fileName } = declaration.getSourceFile();
        const owner = externalFiles.has(fileName) ? packageForFile(fileName) : undefined;

        return !!owner && importedPackages.has(owner.name) && isGlobalDeclaration(ts, declaration);
    };

    // Связываем выпущенные сигнатуры по исходным путям в том же наборе файлов, что у проекта:
    // так находятся и ambient-символы проекта, и глобалы пакетов, импорт которых пропал из деклараций.
    host.getSourceFile = (filename, languageVersion, onError, shouldCreateNewSourceFile) => {
        const emitted = bySource.get(filename);

        return emitted
            ? ts.createSourceFile(filename, emitted.text, languageVersion, true, ts.ScriptKind.TS)
            : getSourceFile(filename, languageVersion, onError, shouldCreateNewSourceFile);
    };
    const program = ts.createProgram(
        producerFiles.map((file) => file.fileName),
        options,
        host,
    );
    const checker = program.getTypeChecker();

    return (sourceFile: string): DeclarationReferences => {
        const boundSource = program.getSourceFile(sourceFile);
        const references: DeclarationReferences = {
            declarations: new Set(),
            globalTypes: new Set(),
        };
        const visit = (node: TypeScript.Node) => {
            if (ts.isIdentifier(node) || ts.isStringLiteral(node)) {
                checker.getSymbolAtLocation(node)?.declarations?.forEach((declaration) => {
                    const owner = declaration.getSourceFile();
                    const emitted = bySource.get(owner.fileName);

                    if (owner.isDeclarationFile && owner !== boundSource && emitted) {
                        references.declarations.add(emitted.filename);
                    } else if (isImportedGlobal(declaration)) {
                        references.globalTypes.add(owner.fileName);
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
