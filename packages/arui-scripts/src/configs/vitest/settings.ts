import fs from 'fs';
import path from 'path';

import tsconfigPaths from 'vite-tsconfig-paths';

function getSetupFiles(cwd: string): string[] {
    const packagePath = path.join(cwd, 'package.json');

    let setupFiles: string[] = [];

    if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as {
            jest?: { setupFiles?: string[] };
        };

        setupFiles = pkg.jest?.setupFiles ?? [];
    }

    return setupFiles.map((file: string) => path.resolve(cwd, file.replace('<rootDir>', '.')));
}

const ASSET_EXTENSIONS = [
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
    '.ico',
    '.bmp',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
];

function isAsset(id: string): boolean {
    return ASSET_EXTENSIONS.some((extension) => id.endsWith(extension));
}

const staticFilesMockPlugin = {
    name: 'arui-scripts-static-files-mock',
    enforce: 'pre' as const,
    load(id: string) {
        if (id.endsWith('.css')) {
            return 'export default {}';
        }

        if (isAsset(id)) {
            const filename = path.basename(id);

            return `export default ${JSON.stringify(filename)}`;
        }

        return undefined;
    },
};

export function getVitestConfig() {
    const cwd = process.cwd();
    const setupFiles = getSetupFiles(cwd);

    return {
        plugins: [tsconfigPaths({ root: cwd }), staticFilesMockPlugin],
        test: {
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
