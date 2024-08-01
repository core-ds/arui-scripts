import * as fs from 'fs';
import * as path from 'path';

export function ensureDirectory(dirPath: string): void {
    const parts = dirPath.split(path.sep);

    for (let i = 1; i <= parts.length; i++) {
        const currentPath = parts.slice(0, i).join(path.sep);

        if (currentPath && !fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath);
        }
    }
}
