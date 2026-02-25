import fs from 'fs';
import path from 'path';

import { parseConfigFileTextToJson } from 'typescript';

function getSetupFiles(cwd: string): string[] {
    const packagePath = path.join(cwd, 'package.json');

    let setupFiles: string[] = [];

    if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as {
            jest?: { setupFiles?: string[] };
        };

        setupFiles = pkg.jest?.setupFiles ?? [];
    }

    return setupFiles.map((file: string) =>
        path.resolve(cwd, file.replace('<rootDir>', '.')),
    );
}

export function getVitestConfig() {
    const cwd = process.cwd();
    const tsconfigPath = path.join(cwd, 'tsconfig.json');
    const baseUrl = path.dirname(tsconfigPath);

    const cssMockPlugin = {
        name: 'arui-scripts-css-mock',
        enforce: 'pre' as const,
        load(id: string) {
            if (id.endsWith('.css')) {
                return 'export default {}';
            }

            return undefined;
        },
    };
    const alias: Array<{ find: string | RegExp; replacement: string }> = [];

    if (fs.existsSync(tsconfigPath)) {
        const tsConfigText = fs.readFileSync(tsconfigPath, 'utf8');
        const { config } = parseConfigFileTextToJson(tsconfigPath, tsConfigText);
        const paths = config?.compilerOptions?.paths as Record<string, string[]> | undefined;
        const tsBaseUrl = config?.compilerOptions?.baseUrl
            ? path.resolve(baseUrl, config.compilerOptions.baseUrl)
            : baseUrl;

        if (paths) {
            for (const [key, value] of Object.entries(paths)) {
                const pattern = key.replace(/\/\*$/, '');
                const target = value[0]?.replace(/\/\*$/, '') ?? '';

                alias.push({
                    find: pattern,
                    replacement: path.resolve(tsBaseUrl, target),
                });
            }
        }
    }

    const setupFiles = getSetupFiles(cwd);

    return {
        plugins: [cssMockPlugin],
        resolve: {
            alias,
        },
        test: {
            globals: true,
            environment: 'jsdom' as const,
            setupFiles,
            include: [
                'src/**/__tests__/**/*.{ts,tsx,js,jsx}',
                'src/**/__test__/**/*.{ts,tsx,js,jsx}',
                'src/**/*.{test,spec,tests}.{ts,tsx,js,jsx}',
            ],
            exclude: ['**/node_modules/**', '**/build/**', '**/.build/**'],
            coverage: {
                provider: 'v8' as const,
                include: ['src/**/*.{js,jsx,ts,tsx}'],
                exclude: ['**/*.d.ts', '**/__tests__/**'],
            },
            environmentOptions: {
                jsdom: {
                    url: 'http://localhost',
                },
            },
        },
    };
}
