import fs from 'fs';
import path from 'path';

type TestRunner = 'jest' | 'vitest';

type InitArgs = {
    clientOnly: boolean;
    force: boolean;
    testRunner: TestRunner;
};

function parseArgs(args: string[]): InitArgs {
    let testRunner: TestRunner = 'jest';

    args.forEach((arg) => {
        if (arg.startsWith('--runner=')) {
            const value = arg.split('=')[1];

            if (value === 'jest' || value === 'vitest') {
                testRunner = value;
            } else {
                throw new Error(`Unknown runner "${value}". Expected one of: jest, vitest.`);
            }
        }
    });

    return {
        clientOnly: args.includes('--client-only'),
        force: args.includes('--force'),
        testRunner,
    };
}

function writeFileIfNeeded(targetPath: string, content: string, force: boolean) {
    if (fs.existsSync(targetPath) && !force) {
        console.log(`Skip existing file: ${path.relative(process.cwd(), targetPath)}`);
        return;
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log(`Created: ${path.relative(process.cwd(), targetPath)}`);
}

function updatePackageJson(cwd: string, testRunner: TestRunner) {
    const packageJsonPath = path.join(cwd, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        throw new Error('package.json not found in current directory.');
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const existingScripts = packageJson.scripts ?? {};

    const testScript =
        testRunner === 'vitest' ? 'arui-scripts test --runner=vitest' : 'arui-scripts test';

    packageJson.scripts = {
        ...existingScripts,
        start: existingScripts.start ?? 'arui-scripts start',
        build: existingScripts.build ?? 'arui-scripts build',
        test: existingScripts.test ?? testScript,
        'test:vitest': existingScripts['test:vitest'] ?? 'arui-scripts test:vitest',
    };

    fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 4)}\n`, 'utf8');
    console.log('Updated package.json scripts');
}

function createConfigFile(cwd: string, clientOnly: boolean, force: boolean) {
    const configPath = path.join(cwd, 'arui-scripts.config.js');

    if (!clientOnly) {
        return;
    }

    const content = `module.exports = {
    clientOnly: true,
};
`;

    writeFileIfNeeded(configPath, content, force);
}

const DEFAULT_CLIENT_ENTRYPOINT = `import React from 'react';
import { hydrateRoot } from 'react-dom/client';

const root = document.getElementById('root');

if (root) {
    hydrateRoot(root, <div>App is ready</div>);
}
`;

const DEFAULT_SERVER_ENTRYPOINT = `import { type IncomingMessage, type ServerResponse } from 'http';

export default function handler(_req: IncomingMessage, res: ServerResponse) {
    res.statusCode = 200;
    res.end('OK');
}
`;

const args = parseArgs(process.argv.slice(3));
const cwd = process.cwd();

writeFileIfNeeded(path.join(cwd, 'src/index.tsx'), DEFAULT_CLIENT_ENTRYPOINT, args.force);

if (!args.clientOnly) {
    writeFileIfNeeded(path.join(cwd, 'src/server/index.ts'), DEFAULT_SERVER_ENTRYPOINT, args.force);
}

createConfigFile(cwd, args.clientOnly, args.force);
updatePackageJson(cwd, args.testRunner);

console.log('');
console.log('Project bootstrap completed.');
console.log('Next steps:');
console.log('1) Install dependencies');
console.log('2) Run: arui-scripts doctor');
console.log('3) Run: arui-scripts start');
