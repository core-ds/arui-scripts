import path from 'path';

import fs from 'fs-extra';

export async function isDirEmpty(dir: string): Promise<boolean> {
    if (!(await fs.pathExists(dir))) {
        return true;
    }

    const entries = await fs.readdir(dir);

    return entries.length === 0;
}

export async function writeFiles(targetDir: string, files: Record<string, string>): Promise<void> {
    await fs.ensureDir(targetDir);

    await Promise.all(
        Object.keys(files).map((relPath) =>
            fs.outputFile(path.join(targetDir, relPath), files[relPath]),
        ),
    );
}
