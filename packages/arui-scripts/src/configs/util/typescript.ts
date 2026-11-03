import fs from 'fs';
import path from 'path';

export function getProjectTypeScript(cwd: string) {
    const packagePath = require.resolve('typescript/package.json', { paths: [cwd] });
    const metadata = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as {
        version: string;
        bin: { tsc: string };
    };

    return { packagePath, ...metadata };
}

export function getProjectTscPath(cwd: string) {
    const { packagePath, bin } = getProjectTypeScript(cwd);

    return path.resolve(path.dirname(packagePath), bin.tsc);
}
