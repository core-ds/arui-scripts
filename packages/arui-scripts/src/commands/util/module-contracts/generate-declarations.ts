import { builtinModules } from 'module';
import path from 'path';

import type * as TypeScript from 'typescript';

import { createContractDependencies, typeReferenceName } from './contract-dependencies';
import { createDeclarationPath, importPath, slash } from './declaration-paths';
import {
    createDeclarationReferences,
    referencePaths,
    rewriteReferencePaths,
} from './declaration-references';
import { emitDeclarations } from './emit-declarations';
import { formatDiagnostics } from './project-typescript';

export type ModuleDeclarations = {
    files: Map<string, string>;
    peerDependencies: Record<string, string>;
};

/** Выпускает замкнутое дерево declarations; не меняет output приложения. */
export function generateModuleDeclarations({
    ts,
    cwd,
    tsconfig,
    exposes,
}: {
    ts: typeof TypeScript;
    cwd: string;
    tsconfig: string;
    exposes: Record<string, string>;
}): ModuleDeclarations {
    const configFile = ts.readConfigFile(tsconfig, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(
        configFile.config || {},
        ts.sys,
        path.dirname(tsconfig),
        undefined,
        tsconfig,
    );
    const format = (diagnostics: readonly TypeScript.Diagnostic[]) =>
        formatDiagnostics(ts, cwd, diagnostics);
    const configErrors = [...(configFile.error ? [configFile.error] : []), ...parsed.errors];

    if (configErrors.length) throw new Error(format(configErrors));
    if (parsed.projectReferences?.length) {
        throw new Error('modules.types: project references пока не поддерживаются.');
    }

    const options: TypeScript.CompilerOptions = {
        ...parsed.options,
        declaration: true,
        emitDeclarationOnly: true,
        noEmit: false,
        noEmitOnError: true,
        noCheck: false,
        // Provider environment types may conflict with the project's DOM/Node versions.
        // The exported declaration tree is checked separately with skipLibCheck disabled.
        skipLibCheck: true,
        declarationMap: false,
        incremental: false,
        composite: false,
        outFile: undefined,
        declarationDir: undefined,
        tsBuildInfoFile: undefined,
        rootDir: cwd,
        outDir: path.join(cwd, '.arui-contract-declarations'),
    };
    const host = ts.createCompilerHost(options);
    const resolveModule = (
        specifier: string,
        containingFile: string,
        mode?: TypeScript.ResolutionMode,
    ) =>
        ts.resolveModuleName(specifier, containingFile, options, host, undefined, undefined, mode)
            .resolvedModule;
    const entrySources: Record<string, string> = {};
    const roots = Object.entries(exposes).map(([id, entry]) => {
        const resolved = resolveModule(entry, path.join(cwd, '__entry__.ts'));

        if (
            !resolved ||
            !/\.(ts|tsx|mts|cts)$/.test(resolved.resolvedFileName) ||
            /\.d\./.test(resolved.resolvedFileName)
        ) {
            throw new Error(`modules.types: ${id}: не найдена TypeScript-точка входа ${entry}`);
        }
        entrySources[id] = resolved.resolvedFileName;

        return resolved.resolvedFileName;
    });
    const ambientRoots = parsed.fileNames.filter((file) => /\.d\.(ts|mts|cts)$/.test(file));
    const program = ts.createProgram([...roots, ...ambientRoots], options);
    const diagnostics = ts.getPreEmitDiagnostics(program);

    if (diagnostics.some((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)) {
        throw new Error(format(diagnostics));
    }

    const declarationPath = createDeclarationPath(ts, program, cwd);
    const entries = Object.fromEntries(
        Object.entries(entrySources).map(([id, filename]) => [id, declarationPath(filename)]),
    );
    const emitted = emitDeclarations(ts, program, declarationPath);
    const { declarations } = emitted;

    if (emitted.diagnostics.length) throw new Error(format(emitted.diagnostics));

    const { peerDependencies, addDependency } = createContractDependencies();
    const files = new Map<string, string>();
    const typeReferences = new Set<string>();
    const queue = Object.values(entries);
    const getDeclarationReferences = createDeclarationReferences(ts, program, declarations);
    const addTypeReference = (specifier: string, resolvedFile: string | undefined) => {
        typeReferences.add(typeReferenceName(addDependency(specifier, resolvedFile)));
    };
    const addNodeTypes = () =>
        addTypeReference(
            '@types/node',
            ts.resolveTypeReferenceDirective('node', path.join(cwd, '__entry__.ts'), options, host)
                .resolvedTypeReferenceDirective?.resolvedFileName,
        );

    const includeDeclaration = (filename: string) => {
        if (files.has(filename)) return;
        const declaration = declarations.get(filename);

        if (!declaration) throw new Error(`modules.types: отсутствует декларация ${filename}`);
        const original = program.getSourceFile(declaration.source);
        const { declarations: references, globalTypes } = getDeclarationReferences(
            declaration.source,
        );

        globalTypes.forEach((file) => addTypeReference(file, file));
        queue.push(...references);
        const text = rewriteReferencePaths(ts, declaration.text, (reference) => {
            const target = declarationPath(
                path.resolve(path.dirname(declaration.source), reference),
            );

            queue.push(target);
            references.delete(target);

            return slash(path.relative(path.dirname(filename), target));
        });
        const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true);
        const resolveImport = (usage: TypeScript.StringLiteral) => {
            const specifier = usage.text;

            if (specifier.startsWith('node:') || builtinModules.includes(specifier)) {
                addNodeTypes();

                return specifier;
            }
            const mode = original && ts.getModeForUsageLocation(original, usage, options);
            const resolved = resolveModule(specifier, declaration.source, mode);

            if (!resolved) return specifier; // Ambient module: проверяется на переносимом output.
            if (!resolved.isExternalLibraryImport) {
                const target = declarationPath(resolved.resolvedFileName);

                queue.push(target);
                references.delete(target);

                return importPath(filename, target);
            }
            if (
                specifier.startsWith('.') ||
                path.isAbsolute(specifier) ||
                specifier.startsWith('#')
            ) {
                throw new Error(
                    `modules.types: используйте публичный npm import вместо ${specifier}`,
                );
            }
            addDependency(specifier, resolved.resolvedFileName);

            return specifier;
        };
        const transformed = ts.transform(source, [
            (context) => {
                const visit: TypeScript.Visitor = (node) => {
                    if (ts.isStringLiteral(node)) {
                        const { parent } = node;
                        const isModuleSpecifier =
                            ((ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) &&
                                parent.moduleSpecifier === node) ||
                            ts.isExternalModuleReference(parent) ||
                            (ts.isModuleDeclaration(parent) && parent.name === node) ||
                            (ts.isLiteralTypeNode(parent) && ts.isImportTypeNode(parent.parent));

                        if (isModuleSpecifier)
                            return ts.factory.createStringLiteral(resolveImport(node));
                    }

                    return ts.visitEachChild(node, visit, context);
                };

                return (node) => ts.visitNode(node, visit) as TypeScript.SourceFile;
            },
        ]);

        try {
            source.typeReferenceDirectives.forEach((reference) => {
                const resolved = ts.resolveTypeReferenceDirective(
                    reference.fileName,
                    declaration.source,
                    options,
                    host,
                ).resolvedTypeReferenceDirective;

                if (resolved) addDependency(reference.fileName, resolved.resolvedFileName);
            });
            files.set(
                filename,
                `${referencePaths(filename, references)}${ts
                    .createPrinter()
                    .printFile(transformed.transformed[0])}`,
            );
        } finally {
            transformed.dispose();
        }
    };

    while (queue.length) {
        includeDeclaration(queue.shift() as string);
    }

    const references = [...typeReferences]
        .sort()
        .map((name) => `/// <reference types=${JSON.stringify(name)} />\n`)
        .join('');

    Object.values(entries).forEach((filename) => {
        files.set(filename, `${references}${files.get(filename)}`);
    });
    files.set(
        'index.d.ts',
        `${references}export type ModuleContracts = {\n${Object.entries(entries)
            .map(
                ([id, filename]) =>
                    `    ${JSON.stringify(id)}: typeof import(${JSON.stringify(
                        importPath('index.d.ts', filename),
                    )});`,
            )
            .join('\n')}\n};\n`,
    );
    files.set(
        'index.d.cts',
        'export type { ModuleContracts } from "./index.js" with { "resolution-mode": "import" };\n',
    );

    return { files, peerDependencies };
}
