import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { extract } from 'tar';
import ts from 'typescript';

import {
    getDefaultAppConfig,
    getDefaultAppContext,
} from '../../../../configs/app-configs/get-defaults';
import { buildModuleContracts } from '../build-module-contracts';

export function createPortableProject(
    options: Record<string, unknown> = {},
    exposes: Record<string, string> = { Widget: './src/index' },
) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-portable-contract-'));
    const cwd = path.join(root, 'provider');
    const write = (filename: string, text: string) => {
        const target = path.join(cwd, filename);

        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, text);
    };

    write('package.json', '{"name":"provider","version":"1.0.0"}');
    write(
        'tsconfig.json',
        JSON.stringify({
            compilerOptions: {
                strict: true,
                target: 'es2022',
                module: 'esnext',
                moduleResolution: 'bundler',
                types: [],
                noEmit: true,
                allowSyntheticDefaultImports: true,
                ...options,
            },
            include: ['src/**/*'],
        }),
    );
    fs.mkdirSync(path.join(cwd, 'node_modules'), { recursive: true });
    fs.symlinkSync(
        path.dirname(require.resolve('typescript/package.json')),
        path.join(cwd, 'node_modules/typescript'),
        'dir',
    );
    const config = {
        ...getDefaultAppConfig(),
        ...getDefaultAppContext(),
        cwd,
        version: '1.0.0',
        tsconfig: path.join(cwd, 'tsconfig.json'),
        serverOutputPath: path.join(cwd, '.build'),
        modules: {
            shared: {},
            exposes,
            types: { packageName: '@fixture/contracts' },
        },
    };

    return { root, cwd, config, write };
}

export async function checkPackedConsumer(
    project: ReturnType<typeof createPortableProject>,
    source: string,
    dependencies: Record<string, string> = {},
    consumerFormat: 'esm' | 'commonjs-node16' = 'esm',
) {
    const { root, cwd, config } = project;
    const parsed = ts.getParsedCommandLineOfConfigFile(
        config.tsconfig,
        {},
        {
            ...ts.sys,
            onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
                throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
            },
        },
    );

    if (!parsed) throw new Error('Expected producer configuration');
    const producer = ts.createProgram(parsed.fileNames, parsed.options);

    expect(ts.getPreEmitDiagnostics(producer)).toEqual([]);
    const directory = buildModuleContracts(config);

    if (!directory) throw new Error('Expected contract package');
    const [packed] = JSON.parse(
        execFileSync(
            'npm',
            [
                'pack',
                directory,
                '--json',
                '--offline',
                '--ignore-scripts',
                '--pack-destination',
                root,
                '--cache',
                path.join(root, 'npm-cache'),
            ],
            { encoding: 'utf8' },
        ),
    ) as Array<{ filename: string; files: Array<{ path: string }> }>;

    expect(
        packed.files.every(
            (file) => file.path === 'package.json' || /\.d\.(ts|mts|cts)$/.test(file.path),
        ),
    ).toBe(true);
    const consumer = path.join(root, 'consumer');
    const installed = path.join(consumer, 'node_modules/@fixture/contracts');

    fs.mkdirSync(installed, { recursive: true });
    await extract({ file: path.join(root, packed.filename), cwd: installed, strip: 1 });
    const manifest = JSON.parse(fs.readFileSync(path.join(installed, 'package.json'), 'utf8')) as {
        peerDependencies: Record<string, string>;
    };

    Object.keys(manifest.peerDependencies).forEach((name) => {
        const dependencyDirectory = dependencies[name];

        if (!dependencyDirectory) return;
        const target = path.join(consumer, 'node_modules', name);

        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.symlinkSync(dependencyDirectory, target, 'dir');
    });
    const commonjs = consumerFormat === 'commonjs-node16';
    const entrypoint = path.join(consumer, commonjs ? 'index.cts' : 'index.mts');

    fs.writeFileSync(entrypoint, source);
    fs.rmSync(cwd, { recursive: true, force: true });
    const program = ts.createProgram([entrypoint], {
        noEmit: true,
        strict: true,
        skipLibCheck: false,
        types: [],
        module: commonjs ? ts.ModuleKind.Node16 : ts.ModuleKind.NodeNext,
        moduleResolution: commonjs
            ? ts.ModuleResolutionKind.Node16
            : ts.ModuleResolutionKind.NodeNext,
        target: ts.ScriptTarget.ESNext,
    });

    expect(
        ts
            .getPreEmitDiagnostics(program)
            .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')),
    ).toEqual([]);

    return manifest;
}
