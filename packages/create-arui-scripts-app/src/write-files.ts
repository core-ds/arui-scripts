import path from 'path';

import fs from 'fs-extra';

export async function findConflictingFiles(
    targetDir: string,
    files: Record<string, string>,
): Promise<string[]> {
    const conflicts: string[] = [];

    await Promise.all(
        Object.keys(files).map(async (relPath) => {
            if (await fs.pathExists(path.join(targetDir, relPath))) {
                conflicts.push(relPath);
            }
        }),
    );

    return conflicts.sort();
}

export async function writeFiles(targetDir: string, files: Record<string, string>): Promise<void> {
    await fs.ensureDir(targetDir);

    await Promise.all(
        Object.keys(files).map((relPath) =>
            fs.outputFile(path.join(targetDir, relPath), files[relPath]),
        ),
    );
}
